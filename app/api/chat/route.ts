import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { getUserProfile } from '@/libs/userProfile';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { decryptAPIKey } from '@/libs/encryption';

interface ChatRequest {
  message: string;
  mode?: string;
  learningMode?: 'Learn' | 'Explore' | 'Create' | 'Assess';
  sessionId?: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { 
      message, 
      mode = 'Learn',
      learningMode,
      sessionId,
      conversationHistory = [],
      stream = true
    }: ChatRequest = await req.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user profile and API key
    const userProfile = await getUserProfile(session.user.id);
    
    if (!userProfile) {
      return NextResponse.json(
        { 
          error: 'User profile not found',
          message: 'User profile not found. Please complete your profile setup.',
          action: 'setup_profile'
        },
        { status: 404 }
      );
    }

    // Check if user has a valid API key
    if (!userProfile.apiKey?.encryptedKey || !userProfile.apiKey.isValid) {
      return NextResponse.json(
        { 
          error: 'No valid Gemini API key found',
          message: 'No valid Gemini API key found. Please add your API key in Profile Settings to use DrLeeGPT.',
          action: 'configure_api_key'
        },
        { status: 400 }
      );
    }

    // Decrypt the user's API key
    let apiKey: string;
    try {
      apiKey = await decryptAPIKey(userProfile.apiKey.encryptedKey, userProfile.apiKey.salt!);
    } catch (error) {
      console.error('Failed to decrypt API key:', error);
      return NextResponse.json(
        { 
          error: 'Failed to decrypt API key',
          message: 'Failed to decrypt API key. Please re-add your API key in Profile Settings.',
          action: 'configure_api_key'
        },
        { status: 500 }
      );
    }

    // Initialize Gemini with user's API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: generateSystemPrompt(userProfile.role, mode)
    });

    // Build conversation context
    const contents = [
      // Add conversation history
      ...conversationHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
      // Add current message with educational context
      {
        role: 'user' as const,
        parts: [{ text: message }]
      }
    ];

    const generationConfig = {
      temperature: 0.7,
      maxOutputTokens: 4096,
    };

    if (stream) {
      // Return streaming response
      const response = await model.generateContentStream({
        contents,
        generationConfig,
      });

      // Create readable stream for SSE
      const encoder = new TextEncoder();
      
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            let fullContent = '';
            
            for await (const chunk of response.stream) {
              const chunkText = chunk.text();
              if (chunkText) {
                fullContent += chunkText;
                
                // Send streaming chunk
                const sseData = `data: ${JSON.stringify({
                  type: 'chunk',
                  content: chunkText
                })}\n\n`;
                controller.enqueue(encoder.encode(sseData));
              }
            }

            // Detect learning principles in the response
            const learningPrinciples = detectLearningPrinciples(fullContent, mode);

            // Analyze user input
            const userLearningProfile = analyzeUserInput(message);

            // Send final completion with learning principles
            const completeData = `data: ${JSON.stringify({
              type: 'complete',
              learningPrinciples: learningPrinciples,
              mode: mode,
              userLearningProfile: userLearningProfile
            })}\n\n`;
            controller.enqueue(encoder.encode(completeData));
            
            controller.close();
          } catch (error: any) {
            console.error('Streaming error:', error);
            
            // Handle quota exceeded or API errors
            if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
              const errorData = `data: ${JSON.stringify({
                type: 'error',
                message: 'API quota exceeded. Please check your usage limits or upgrade your plan.',
                action: 'check_usage'
              })}\n\n`;
              controller.enqueue(encoder.encode(errorData));
            } else {
              const errorData = `data: ${JSON.stringify({
                type: 'error',
                message: 'An error occurred while generating the response.'
              })}\n\n`;
              controller.enqueue(encoder.encode(errorData));
            }
            
            controller.close();
          }
        }
      });

      return new NextResponse(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response for compatibility
      const response = await model.generateContent({
        contents,
        generationConfig,
      });

      const responseText = response.response.text();
      const learningPrinciples = detectLearningPrinciples(responseText, mode);

      // Analyze user input
      const userLearningProfile = analyzeUserInput(message);

      return NextResponse.json({
        success: true,
        data: {
          message: responseText,
          learningPrinciples: learningPrinciples,
          mode: mode,
          userLearningProfile: userLearningProfile
        }
      });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to process your request. Please try again.',
        action: 'retry'
      },
      { status: 500 }
    );
  }
}

interface UserLearningProfile {
  learningIntent: string[];
  knowledgeLevel: string;
  learningStyle: string[];
  emotionalState: string[];
  priorKnowledge: string;
  questionType: string[];
  subjectDomain: string[];
  metacognitiveAwareness: string[];
  complexity: string;
  urgency: string;
}

function analyzeUserInput(input: string): UserLearningProfile {
  const profile: UserLearningProfile = {
    learningIntent: [],
    knowledgeLevel: 'intermediate',
    learningStyle: [],
    emotionalState: [],
    priorKnowledge: 'some_background',
    questionType: [],
    subjectDomain: [],
    metacognitiveAwareness: [],
    complexity: 'moderate',
    urgency: 'normal'
  };
  
  const lowercaseInput = input.toLowerCase();
  
  // Learning Intent Detection
  if (lowercaseInput.includes('explain') || lowercaseInput.includes('what is') || 
      lowercaseInput.includes('how does') || lowercaseInput.includes('why') ||
      lowercaseInput.includes('understand') || lowercaseInput.includes('clarify')) {
    profile.learningIntent.push('understand');
  }
  
  if (lowercaseInput.includes('practice') || lowercaseInput.includes('try') || 
      lowercaseInput.includes('quiz me') || lowercaseInput.includes('test me') ||
      lowercaseInput.includes('exercise') || lowercaseInput.includes('do')) {
    profile.learningIntent.push('practice');
  }
  
  if (lowercaseInput.includes('apply') || lowercaseInput.includes('use') || 
      lowercaseInput.includes('implement') || lowercaseInput.includes('real world') ||
      lowercaseInput.includes('in practice') || lowercaseInput.includes('example')) {
    profile.learningIntent.push('apply');
  }
  
  if (lowercaseInput.includes('create') || lowercaseInput.includes('make') || 
      lowercaseInput.includes('build') || lowercaseInput.includes('design') ||
      lowercaseInput.includes('develop') || lowercaseInput.includes('generate')) {
    profile.learningIntent.push('create');
  }
  
  if (lowercaseInput.includes('review') || lowercaseInput.includes('recap') || 
      lowercaseInput.includes('summarize') || lowercaseInput.includes('go over') ||
      lowercaseInput.includes('refresh') || lowercaseInput.includes('remind')) {
    profile.learningIntent.push('review');
  }
  
  // Knowledge Level Assessment
  const beginnerIndicators = ['basic', 'simple', 'easy', 'beginner', 'start', 'first time', 'new to'];
  const advancedIndicators = ['advanced', 'complex', 'detailed', 'in-depth', 'nuanced', 'sophisticated'];
  const expertIndicators = ['optimize', 'best practices', 'edge cases', 'trade-offs', 'architecture'];
  
  if (beginnerIndicators.some(indicator => lowercaseInput.includes(indicator))) {
    profile.knowledgeLevel = 'beginner';
  } else if (expertIndicators.some(indicator => lowercaseInput.includes(indicator))) {
    profile.knowledgeLevel = 'expert';
  } else if (advancedIndicators.some(indicator => lowercaseInput.includes(indicator))) {
    profile.knowledgeLevel = 'advanced';
  }
  
  // Learning Style Indicators
  if (lowercaseInput.includes('show me') || lowercaseInput.includes('diagram') || 
      lowercaseInput.includes('chart') || lowercaseInput.includes('visual') ||
      lowercaseInput.includes('picture') || lowercaseInput.includes('graph')) {
    profile.learningStyle.push('visual');
  }
  
  if (lowercaseInput.includes('explain') || lowercaseInput.includes('tell me') || 
      lowercaseInput.includes('discuss') || lowercaseInput.includes('describe') ||
      lowercaseInput.includes('talk about')) {
    profile.learningStyle.push('auditory');
  }
  
  if (lowercaseInput.includes('hands-on') || lowercaseInput.includes('try it') || 
      lowercaseInput.includes('experiment') || lowercaseInput.includes('interactive') ||
      lowercaseInput.includes('practice') || lowercaseInput.includes('do')) {
    profile.learningStyle.push('kinesthetic');
  }
  
  if (lowercaseInput.includes('list') || lowercaseInput.includes('steps') || 
      lowercaseInput.includes('write down') || lowercaseInput.includes('notes') ||
      lowercaseInput.includes('outline') || lowercaseInput.includes('bullet points')) {
    profile.learningStyle.push('reading_writing');
  }
  
  // Default to auditory if no specific learning style detected
  if (profile.learningStyle.length === 0) {
    profile.learningStyle.push('auditory');
  }
  
  // Emotional State Detection
  if (lowercaseInput.includes('confused') || lowercaseInput.includes('lost') || 
      lowercaseInput.includes('don\'t get') || lowercaseInput.includes('unclear') ||
      lowercaseInput.includes('not sure') || lowercaseInput.includes('help me understand')) {
    profile.emotionalState.push('confused');
  }
  
  if (lowercaseInput.includes('frustrated') || lowercaseInput.includes('hard') || 
      lowercaseInput.includes('difficult') || lowercaseInput.includes('struggling') ||
      lowercaseInput.includes('can\'t figure out') || lowercaseInput.includes('stuck')) {
    profile.emotionalState.push('frustrated');
  }
  
  if (lowercaseInput.includes('interesting') || lowercaseInput.includes('curious') || 
      lowercaseInput.includes('wonder') || lowercaseInput.includes('fascinated') ||
      lowercaseInput.includes('explore') || lowercaseInput.includes('what if')) {
    profile.emotionalState.push('curious');
  }
  
  if (lowercaseInput.includes('i think') || lowercaseInput.includes('i believe') || 
      lowercaseInput.includes('let me try') || lowercaseInput.includes('i got this') ||
      lowercaseInput.includes('confident') || lowercaseInput.includes('ready')) {
    profile.emotionalState.push('confident');
  }
  
  // Default to neutral if no specific emotional indicators
  if (profile.emotionalState.length === 0) {
    profile.emotionalState.push('neutral');
  }
  
  // Question Type Classification
  if (lowercaseInput.includes('how') || lowercaseInput.includes('explain') ||
      lowercaseInput.includes('what') || lowercaseInput.includes('why')) {
    profile.questionType.push('explanation');
  }
  
  if (lowercaseInput.includes('example') || lowercaseInput.includes('instance') ||
      lowercaseInput.includes('case study') || lowercaseInput.includes('scenario')) {
    profile.questionType.push('example');
  }
  
  if (lowercaseInput.includes('practice') || lowercaseInput.includes('exercise') ||
      lowercaseInput.includes('drill') || lowercaseInput.includes('workout')) {
    profile.questionType.push('practice');
  }
  
  if (lowercaseInput.includes('test') || lowercaseInput.includes('quiz') ||
      lowercaseInput.includes('assess') || lowercaseInput.includes('evaluate')) {
    profile.questionType.push('assessment');
  }
  
  // Subject Domain Detection (enhanced implementation)
  const subjects = {
    'math': ['math', 'calculus', 'algebra', 'geometry', 'statistics', 'equation', 'formula', 'calculate'],
    'science': ['biology', 'chemistry', 'physics', 'science', 'experiment', 'hypothesis', 'theory', 'research'],
    'programming': ['code', 'programming', 'software', 'algorithm', 'function', 'variable', 'debug', 'api'],
    'language': ['grammar', 'writing', 'literature', 'essay', 'vocabulary', 'syntax', 'language', 'communication'],
    'history': ['history', 'historical', 'past', 'ancient', 'civilization', 'timeline', 'era', 'period'],
    'business': ['business', 'marketing', 'finance', 'management', 'strategy', 'economics', 'sales', 'profit'],
    'engineering': ['build', 'design', 'construct', 'engineering', 'mechanical', 'electrical', 'structure', 'system'],
    'diy_crafts': ['craft', 'make', 'create', 'diy', 'handmade', 'project', 'build', 'trap', 'tool'],
    'health': ['health', 'medical', 'wellness', 'fitness', 'nutrition', 'exercise', 'body', 'mental health'],
    'arts': ['art', 'music', 'painting', 'drawing', 'creative', 'design', 'aesthetic', 'visual'],
    'general': ['how to', 'step by step', 'tutorial', 'guide', 'instructions', 'process', 'method']
  };
  
  Object.entries(subjects).forEach(([domain, keywords]) => {
    if (keywords.some(keyword => lowercaseInput.includes(keyword))) {
      profile.subjectDomain.push(domain);
    }
  });
  
  // Default to general if no specific domain detected
  if (profile.subjectDomain.length === 0) {
    profile.subjectDomain.push('general');
  }
  
  // Metacognitive Awareness Detection
  if (lowercaseInput.includes('how do i learn') || lowercaseInput.includes('study strategy') ||
      lowercaseInput.includes('learning approach') || lowercaseInput.includes('best way to learn')) {
    profile.metacognitiveAwareness.push('learning_strategy');
  }
  
  if (lowercaseInput.includes('am i understanding') || lowercaseInput.includes('check my understanding') ||
      lowercaseInput.includes('self-assess') || lowercaseInput.includes('how am i doing')) {
    profile.metacognitiveAwareness.push('self_monitoring');
  }
  
  if (lowercaseInput.includes('reflect') || lowercaseInput.includes('think about') ||
      lowercaseInput.includes('consider') || lowercaseInput.includes('analyze my')) {
    profile.metacognitiveAwareness.push('reflection');
  }
  
  // Complexity Assessment
  if (lowercaseInput.length > 200 || lowercaseInput.split('.').length > 3) {
    profile.complexity = 'high';
  } else if (lowercaseInput.length < 50 || lowercaseInput.split(' ').length < 10) {
    profile.complexity = 'low';
  }
  
  // Urgency Detection
  if (lowercaseInput.includes('urgent') || lowercaseInput.includes('asap') ||
      lowercaseInput.includes('quickly') || lowercaseInput.includes('deadline') ||
      lowercaseInput.includes('test tomorrow') || lowercaseInput.includes('due soon')) {
    profile.urgency = 'high';
  }
  
  return profile;
}

function generateSystemPrompt(mode: string, userRole: string = 'USER'): string {
  const basePrompt = `You are DrLeeGPT, an advanced educational AI assistant built on comprehensive learning science research with five core educational superpowers:

🎯 **Core Educational Superpowers:**
1. **Personalized Learning** - Adapt content to individual learning styles, pace, and background
2. **Active Learning** - Engage learners through interactive experiences, practice, and healthy struggle
3. **Meaningful Learning** - Connect new concepts to existing knowledge and real-world applications
4. **Social Learning** - Encourage collaboration, discussion, and peer interaction
5. **Metacognitive Awareness** - Help learners plan, monitor, and reflect on their learning process

🧠 **Learning Science Foundation:**
Your responses are analyzed by a sophisticated detection system that identifies 20+ evidence-based learning principles including:
- **Core Principles:** Active Learning, Cognitive Load Management, Adaptivity, Engagement, Metacognition, Personalization, Feedback
- **Memory & Cognition:** Retention, Comprehension, Spaced Practice, Retrieval Practice, Interleaving, Elaboration
- **Pedagogical Methods:** Scaffolding, Socratic Questioning, Concrete Examples, Real-world Relevance, Prior Knowledge Connection
- **Advanced Strategies:** Critical Thinking, Collaborative Learning, Dual Coding, Multimodal Learning, Goal-Oriented Design

📋 **Response Guidelines:**
- Apply multiple learning science principles naturally in your responses
- Use clear, conversational language with proper structure
- Include concrete examples, analogies, and real-world connections
- Encourage active participation through practice and questioning
- Provide timely feedback and check for understanding
- Structure information to manage cognitive load effectively
- Connect new learning to prior knowledge and experience

🎯 **Current Mode: ${mode}`;

  const modeInstructions = {
    'Learn': `
**Learn Mode - Master New Concepts:**
- Break down complex topics into digestible chunks with scaffolding
- Provide multiple concrete examples and analogies
- Use spaced practice and retrieval techniques
- Ask comprehension-checking questions
- Offer hands-on practice opportunities and timely feedback`,

    'Explore': `
**Explore Mode - Guided Discovery:**
- Encourage curiosity and investigation through engaging content
- Use Socratic questioning to stimulate critical thinking
- Guide learners to discover connections and patterns
- Provide resources for deeper exploration
- Support inquiry-based and collaborative learning`,

    'Create': `
**Create Mode - Generate Educational Content:**
- Help design lessons, activities, and assessments using learning science principles
- Provide templates and frameworks with multimodal elements
- Suggest creative approaches incorporating real-world relevance
- Support project-based and goal-oriented learning initiatives
- Offer constructive feedback on educational materials`,

    'Assess': `
**Assess Mode - Evaluate Understanding:**
- Create formative and summative assessments with clear objectives
- Provide rubrics and evaluation criteria
- Suggest metacognitive self-assessment strategies
- Offer evidence-based feedback techniques
- Support data-driven instruction and personalized learning decisions`
  };

  const roleContext = userRole === 'INSTRUCTOR' || userRole === 'ADMIN' 
    ? '\n🎓 **Instructor Context:** You are assisting an educator. Focus on pedagogical strategies, classroom management, instructional design, and learning science implementation.'
    : '\n👨‍🎓 **Learner Context:** You are assisting a student. Focus on understanding, skill development, learning strategies, and metacognitive awareness.';

  return basePrompt + '\n' + (modeInstructions[mode as keyof typeof modeInstructions] || modeInstructions['Learn']) + roleContext + `

📝 **Important Formatting Rules:**
- Use proper markdown formatting (## for headings, **bold**, *italic*, bullet points)
- Structure responses clearly with logical progression
- Use engaging, conversational tone while applying learning principles
- Include concrete examples and real-world connections
- End with actionable next steps, practice opportunities, or reflective questions
- Naturally incorporate multiple learning science principles in each response`;
}

function detectLearningPrinciples(response: string, mode: string): string[] {
  const principles = [];
  const lowercaseResponse = response.toLowerCase();
  
  // 1. Active Learning
  if (lowercaseResponse.includes('try') || lowercaseResponse.includes('practice') || 
      lowercaseResponse.includes('experiment') || lowercaseResponse.includes('create') || 
      lowercaseResponse.includes('build') || lowercaseResponse.includes('hands-on') ||
      lowercaseResponse.includes('do') || lowercaseResponse.includes('apply')) {
    principles.push('Active Learning');
  }
  
  // 2. Cognitive Load Management
  if (lowercaseResponse.includes('step-by-step') || lowercaseResponse.includes('chunk') || 
      lowercaseResponse.includes('simplify') || lowercaseResponse.includes('organize') || 
      lowercaseResponse.includes('structure') || lowercaseResponse.includes('break down') ||
      lowercaseResponse.includes('manageable') || lowercaseResponse.includes('digestible')) {
    principles.push('Cognitive Load Management');
  }
  
  // 3. Adaptivity
  if (lowercaseResponse.includes('adjust') || lowercaseResponse.includes('customize') || 
      lowercaseResponse.includes('adapt') || lowercaseResponse.includes('modify') || 
      lowercaseResponse.includes('personalize') || lowercaseResponse.includes('tailor') ||
      lowercaseResponse.includes('flexible')) {
    principles.push('Adaptivity');
  }
  
  // 4. Curiosity & Engagement
  if (lowercaseResponse.includes('interesting') || lowercaseResponse.includes('exciting') || 
      lowercaseResponse.includes('engaging') || lowercaseResponse.includes('motivating') || 
      lowercaseResponse.includes('curious') || lowercaseResponse.includes('wonder') ||
      lowercaseResponse.includes('fascinate') || lowercaseResponse.includes('inspire')) {
    principles.push('Curiosity & Engagement');
  }
  
  // 5. Metacognition
  if (lowercaseResponse.includes('think about') || lowercaseResponse.includes('reflect') || 
      lowercaseResponse.includes('consider') || lowercaseResponse.includes('ask yourself') || 
      lowercaseResponse.includes('self-assess') || lowercaseResponse.includes('monitor') ||
      lowercaseResponse.includes('awareness') || lowercaseResponse.includes('planning')) {
    principles.push('Metacognition');
  }
  
  // 6. Personalization
  if (lowercaseResponse.includes('your') || lowercaseResponse.includes('you might') || 
      lowercaseResponse.includes('depending on your') || lowercaseResponse.includes('based on your') || 
      lowercaseResponse.includes('tailored') || lowercaseResponse.includes('individual') ||
      lowercaseResponse.includes('personal')) {
    principles.push('Personalization');
  }
  
  // 7. Feedback
  if (lowercaseResponse.includes('correct') || lowercaseResponse.includes('good job') || 
      lowercaseResponse.includes('well done') || lowercaseResponse.includes('check your') || 
      lowercaseResponse.includes('assess') || lowercaseResponse.includes('improve') ||
      lowercaseResponse.includes('feedback') || lowercaseResponse.includes('guidance')) {
    principles.push('Feedback');
  }
  
  // 8. Retention
  if (lowercaseResponse.includes('remember') || lowercaseResponse.includes('recall') || 
      lowercaseResponse.includes('memorize') || lowercaseResponse.includes('review') || 
      lowercaseResponse.includes('reinforce') || lowercaseResponse.includes('retain') ||
      lowercaseResponse.includes('long-term') || lowercaseResponse.includes('permanent')) {
    principles.push('Retention');
  }
  
  // 9. Comprehension
  if (lowercaseResponse.includes('understand') || lowercaseResponse.includes('make sense') || 
      lowercaseResponse.includes('clear') || lowercaseResponse.includes('grasp') || 
      lowercaseResponse.includes('does that help') || lowercaseResponse.includes('comprehend') ||
      lowercaseResponse.includes('insight') || lowercaseResponse.includes('meaning')) {
    principles.push('Comprehension');
  }
  
  // 10. Spaced Practice
  if (lowercaseResponse.includes('revisit') || lowercaseResponse.includes('review later') || 
      lowercaseResponse.includes('come back') || lowercaseResponse.includes('practice again') || 
      lowercaseResponse.includes('spacing') || lowercaseResponse.includes('distributed') ||
      lowercaseResponse.includes('over time') || lowercaseResponse.includes('intervals')) {
    principles.push('Spaced Practice');
  }
  
  // 11. Retrieval Practice
  if (lowercaseResponse.includes('recall') || lowercaseResponse.includes('retrieve') || 
      lowercaseResponse.includes('test yourself') || lowercaseResponse.includes('quiz') || 
      lowercaseResponse.includes('without looking') || lowercaseResponse.includes('from memory') ||
      lowercaseResponse.includes('self-test') || lowercaseResponse.includes('active recall')) {
    principles.push('Retrieval Practice');
  }
  
  // 12. Interleaving
  if (lowercaseResponse.includes('mix') || lowercaseResponse.includes('alternate') || 
      lowercaseResponse.includes('switch between') || lowercaseResponse.includes('combine') || 
      lowercaseResponse.includes('interleave') || lowercaseResponse.includes('variety') ||
      lowercaseResponse.includes('different types')) {
    principles.push('Interleaving');
  }
  
  // 13. Elaboration
  if (lowercaseResponse.includes('explain why') || lowercaseResponse.includes('elaborate') || 
      lowercaseResponse.includes('expand on') || lowercaseResponse.includes('tell me more') || 
      lowercaseResponse.includes('detail') || lowercaseResponse.includes('deeper') ||
      lowercaseResponse.includes('because') || lowercaseResponse.includes('reasoning')) {
    principles.push('Elaboration');
  }
  
  // 14. Dual Coding
  if (lowercaseResponse.includes('visual') || lowercaseResponse.includes('diagram') || 
      lowercaseResponse.includes('chart') || lowercaseResponse.includes('image') || 
      lowercaseResponse.includes('picture') || lowercaseResponse.includes('graphic') ||
      lowercaseResponse.includes('illustration') || lowercaseResponse.includes('visual aid')) {
    principles.push('Dual Coding');
  }
  
  // 15. Concrete Examples
  if (lowercaseResponse.includes('example') || lowercaseResponse.includes('for instance') || 
      lowercaseResponse.includes('such as') || lowercaseResponse.includes('like when') || 
      lowercaseResponse.includes('real case') || lowercaseResponse.includes('scenario') ||
      lowercaseResponse.includes('illustration') || lowercaseResponse.includes('demonstration')) {
    principles.push('Concrete Examples');
  }
  
  // 16. Scaffolding
  if (lowercaseResponse.includes('step') || lowercaseResponse.includes('first') || 
      lowercaseResponse.includes('next') || lowercaseResponse.includes('break down') || 
      lowercaseResponse.includes('gradually') || lowercaseResponse.includes('build up') ||
      lowercaseResponse.includes('support') || lowercaseResponse.includes('guide')) {
    principles.push('Scaffolding');
  }
  
  // 17. Socratic Questioning
  if (lowercaseResponse.includes('?') && (mode === 'Explore' || 
      lowercaseResponse.includes('what do you think') || lowercaseResponse.includes('how would you') || 
      lowercaseResponse.includes('why might') || lowercaseResponse.includes('what if') ||
      lowercaseResponse.includes('consider this') || lowercaseResponse.includes('how does'))) {
    principles.push('Socratic Questioning');
  }
  
  // 18. Real-world Relevance
  if (lowercaseResponse.includes('real-world') || lowercaseResponse.includes('application') || 
      lowercaseResponse.includes('everyday') || lowercaseResponse.includes('practical') || 
      lowercaseResponse.includes('real life') || lowercaseResponse.includes('workplace') ||
      lowercaseResponse.includes('career') || lowercaseResponse.includes('professional')) {
    principles.push('Real-world Relevance');
  }
  
  // 19. Prior Knowledge Connection
  if (lowercaseResponse.includes('you already know') || lowercaseResponse.includes('familiar') || 
      lowercaseResponse.includes('previously') || lowercaseResponse.includes('building on') || 
      lowercaseResponse.includes('remember when') || lowercaseResponse.includes('like we discussed') ||
      lowercaseResponse.includes('foundation') || lowercaseResponse.includes('background')) {
    principles.push('Prior Knowledge Connection');
  }
  
  // 20. Critical Thinking
  if (lowercaseResponse.includes('analyze') || lowercaseResponse.includes('evaluate') || 
      lowercaseResponse.includes('compare') || lowercaseResponse.includes('contrast') || 
      lowercaseResponse.includes('why') || lowercaseResponse.includes('reasoning') ||
      lowercaseResponse.includes('logic') || lowercaseResponse.includes('evidence')) {
    principles.push('Critical Thinking');
  }
  
  // 21. Collaborative Learning
  if (lowercaseResponse.includes('discuss') || lowercaseResponse.includes('share') || 
      lowercaseResponse.includes('work with') || lowercaseResponse.includes('peer') || 
      lowercaseResponse.includes('collaborate') || lowercaseResponse.includes('together') ||
      lowercaseResponse.includes('group') || lowercaseResponse.includes('team')) {
    principles.push('Collaborative Learning');
  }
  
  // 22. Multimodal Learning
  if (lowercaseResponse.includes('see') || lowercaseResponse.includes('hear') || 
      lowercaseResponse.includes('touch') || lowercaseResponse.includes('multiple ways') || 
      lowercaseResponse.includes('different formats') || lowercaseResponse.includes('various methods') ||
      lowercaseResponse.includes('audio') || lowercaseResponse.includes('kinesthetic')) {
    principles.push('Multimodal Learning');
  }
  
  // 23. Goal-Oriented Design
  if (lowercaseResponse.includes('objective') || lowercaseResponse.includes('goal') || 
      lowercaseResponse.includes('aim') || lowercaseResponse.includes('target') || 
      lowercaseResponse.includes('outcome') || lowercaseResponse.includes('achieve') ||
      lowercaseResponse.includes('purpose') || lowercaseResponse.includes('learning objective')) {
    principles.push('Goal-Oriented Design');
  }
  
  return principles;
}

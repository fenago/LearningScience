# DrLeeGPT Page Specification (Revised)

## Overview

This document provides detailed specifications for the DrLeeGPT page within the LearningScience platform. The page is designed to prioritize the core chat experience while providing easy access to supporting features like example prompts, learning principles, instructor customization, and marketing information.

## Brand Identity

- **Primary Color**: Primary Blue (#3B82F6)
- **Secondary Color**: Secondary Purple (#8B5CF6)
- **Accent Color**: Accent Green (#10B981)
- **Neutral Colors**:
  - Dark: #1F2937
  - Medium: #6B7280
  - Light: #F3F4F6
  - White: #FFFFFF
- **Typography**: 'Inter', sans-serif
  - Headings: 700 (bold) for main headings, 600 (semibold) for subheadings
  - Body: 400 (regular), 500 (medium) for emphasis

## Page Layout

The DrLeeGPT page follows an app-centric layout that prioritizes the chat experience:

1. **Main Chat Interface** - Central, primary focus of the page
2. **Context Panel** - Collapsible side panel for context and history
3. **Examples Panel** - Accessible drawer with copyable prompts
4. **Learning Principles** - Subtle indicators with expandable details
5. **Instructor Controls** - Accessible through settings menu
6. **Marketing Tab** - Discreet tab access to marketing and sales information

## Section-by-Section Specification

### 1. Main Chat Interface

**Layout:**
- Central, dominant element taking majority of screen space
- Full-height design with responsive width
- Clean, distraction-free background
- Subtle branding elements

**Components:**
- **21st.dev ChatInterface** with modern styling
- **MagicUI MessageBubbles** with typing animations
- **MagicUI InputField** with expandable options
- **21st.dev SplashCursor** effect on interactive elements

**Elements:**
- Minimal header with:
  - DrLeeGPT logo/name
  - Session context indicator
  - Settings menu access
  - Examples panel toggle
  - Marketing tab access (subtle, non-intrusive)
- Message history with:
  - Clear visual distinction between user and AI
  - Timestamp and learning principle indicators
  - Interaction options (copy, save, regenerate)
- Input area with:
  - Expandable text field
  - Send button with MagicUI ShineHover effect
  - Attachment options
  - Voice input toggle

**Interactions:**
- SplashCursor effect on clicks within the interface
- Smooth scrolling with momentum
- Real-time typing animation for AI responses
- Expandable messages for longer content
- Hover actions for message options

### 2. Context Panel

**Layout:**
- Collapsible side panel (left side)
- Width: 280px when expanded, icon-only when collapsed
- Full height of application
- Subtle background differentiation from main chat

**Components:**
- **21st.dev SidePanel** with collapse functionality
- **MagicUI TabGroup** for context categories
- **MagicUI List** for conversation history

**Content:**
- Conversation history with:
  - Searchable list of past conversations
  - Preview snippets and timestamps
  - Categorization and filtering options
- Context controls:
  - Course material references
  - Learning history integration
  - Knowledge graph visualization
- Quick actions:
  - New conversation
  - Import/export conversations
  - Template access

**Interactions:**
- Smooth expand/collapse animation
- Hover states with MagicUI BorderBeam effect
- Drag and drop for organizing saved conversations
- Context switching with smooth transition effects

### 3. Examples Panel

**Layout:**
- Accessible through button in header or keyboard shortcut
- Slides in from right side as overlay or drawer
- Width: 400px on desktop, full-width on mobile
- Scrollable content with categorized sections

**Components:**
- **21st.dev DrawerPanel** with smooth animation
- **MagicUI TabGroup** for example categories
- **21st.dev CodeBlock** for formatted prompts
- **MagicUI CopyButton** with success animation

**Content:**
- Tab categories based on LearnLM use cases:
  - Test Prep
  - Teach a Concept
  - Releveling
  - Guide a Learning Activity
  - Homework Help

**For Each Example:**
- Title and brief description
- Copyable system instruction in a code block with:
  - MagicUI CopyButton with success animation
  - Syntax highlighting for readability
  - MagicUI BorderBeam focus effect
- Copyable user prompt with similar styling
- Learning principles targeted (with icons and tooltips)
- "Try This" button to load example into chat

**Example Card Structure:**
```
┌─────────────────────────────────────────┐
│ 🧠 Test Prep                            │
│                                         │
│ System Instruction:                     │
│ ┌─────────────────────────────────┐ 📋 │
│ │ You are a tutor helping a       │     │
│ │ student prepare for a test...   │     │
│ └─────────────────────────────────┘     │
│                                         │
│ User Prompt:                            │
│ ┌─────────────────────────────────┐ 📋 │
│ │ Help me study for a high school │     │
│ │ biology test on ecosystems      │     │
│ └─────────────────────────────────┘     │
│                                         │
│ Learning Principles:                    │
│ 🔄 Adaptivity                           │
│ 🏃 Active Learning                      │
│                                         │
│ [Try This Example]                      │
└─────────────────────────────────────────┘
```

**Interactions:**
- Smooth drawer open/close animations
- Tab switching with subtle transitions
- Copy button with success animation and toast notification
- "Try This" button loads example directly into chat interface
- Hover effects with MagicUI ShineHover

### 4. Learning Principles Indicators

**Layout:**
- Subtle, non-intrusive indicators within chat messages
- Expandable details panel on click/hover
- Consistent positioning for easy recognition

**Components:**
- **MagicUI BadgeGroup** with animated icons
- **21st.dev Tooltip** with expanded information
- **MagicUI ExpandPanel** for detailed explanations

**Content:**
- Icon-based indicators for each principle:
  1. **Active Learning**: Brain with lightning bolt
  2. **Cognitive Load**: Organized blocks/layers
  3. **Adaptivity**: Customization symbol
  4. **Curiosity**: Magnifying glass or lightbulb
  5. **Metacognition**: Reflection/mirror symbol

**Implementation:**
- Small badges appear alongside AI messages
- Color intensity indicates strength of principle application
- Hover reveals brief description
- Click expands to detailed explanation with examples
- Option to filter chat by principle type

**Interactions:**
- Subtle entrance animation when principles are detected
- Hover reveals brief tooltip explanation
- Click expands to detailed panel with examples
- Option to highlight text in message that demonstrates principle

### 5. Instructor Controls

**Layout:**
- Accessible through settings menu in header
- Opens as modal overlay with tabbed interface
- Responsive design adapts to screen size
- Preview panel shows changes in real-time

**Components:**
- **21st.dev SettingsModal** with organized sections
- **MagicUI Controls** (sliders, toggles, inputs)
- **MagicUI PreviewPanel** for real-time feedback
- **21st.dev ActionButtons** for saving/applying changes

**Control Categories:**

1. **System Instruction Editor**
   - Editable text area with syntax highlighting
   - Template selector dropdown
   - Save/reset buttons
   - Character count and recommendations

2. **Learning Style Adjustments**
   - Teaching style slider (Socratic ↔ Direct)
   - Depth slider (Introductory ↔ Advanced)
   - Pace slider (Deliberate ↔ Accelerated)
   - Tone slider (Formal ↔ Conversational)

3. **Content Presentation**
   - Toggle for including examples
   - Toggle for visual aids
   - Toggle for step-by-step breakdowns
   - Toggle for analogies and metaphors

4. **Assessment Options**
   - Toggle for comprehension checks
   - Toggle for reflection prompts
   - Frequency slider for questions
   - Difficulty progression control

**Student View Toggle:**
- Switch to preview the interface as students would see it
- Simplified controls but visible indicators of active learning principles
- Option to provide feedback on effectiveness

**Interactions:**
- Settings changes cause real-time updates in preview
- Preset configurations can be selected and modified
- Save configuration as template functionality
- Export settings as JSON for implementation
- Smooth transitions between settings tabs

### 6. Marketing Tab

**Layout:**
- Accessible through a subtle tab or button in the header
- Opens as a slide-in panel or modal overlay
- Does not interfere with the main chat experience
- Clean, professional design consistent with brand

**Components:**
- **21st.dev TabPanel** with smooth transition
- **MagicUI ContentCards** for feature highlights
- **21st.dev Carousel** for testimonials or use cases
- **MagicUI CTAButton** for upgrade/share actions

**Content Sections:**

1. **DrLeeGPT Overview**
   - Brief description of DrLeeGPT capabilities
   - Key differentiators from standard AI assistants
   - Educational foundations and learning science principles
   - Visual representation of benefits

2. **Feature Highlights**
   - Interactive cards showcasing key features
   - Before/after examples of learning improvements
   - Visual demonstrations of capabilities
   - Integration possibilities

3. **Educational Impact**
   - Data visualization of learning outcomes
   - Case studies from educational institutions
   - Student success stories
   - Research backing and educational theory

4. **Pricing & Plans**
   - Current subscription information
   - Feature comparison across tiers
   - Special offers for educators
   - Volume licensing options

5. **Share & Refer**
   - Easy sharing options for colleagues
   - Referral program information
   - Downloadable resources for presentations
   - Integration guides for institutions

**Interactions:**
- Smooth entrance/exit animations
- Interactive feature demonstrations
- One-click sharing functionality
- Easy return to chat interface
- Subtle microinteractions on hover/click

## Special Features

### 1. SplashCursor Implementation

**Component:** MagicUI SplashCursor (as seen in https://21st.dev/DavidHDev/splash-cursor/default)

**Implementation:**
- Custom cursor effect that creates a splash/ripple effect when clicking
- Color matches brand palette (gradient from Primary Blue to Secondary Purple)
- Size adjustable based on interaction importance
- Subtle trailing effect during movement

**Behavior:**
- Standard splash on regular clicks
- Enhanced splash effect on interactive elements
- Subtle continuous animation when hovering over interactive areas
- Reduced effect on mobile (performance optimization)

### 2. Copyable Example Blocks

**Component:** 21st.dev CodeBlock with MagicUI CopyButton

**Implementation:**
- Styled code blocks for system instructions and user prompts
- Syntax highlighting for improved readability
- One-click copy functionality with visual feedback
- Success animation and toast notification on copy

**Features:**
- Automatic formatting of pasted content
- Option to copy as markdown or plain text
- Visual indicator of copied state
- Mobile-friendly tap targets

### 3. Learning Principle Indicators

**Component:** MagicUI BadgeGroup with animated icons

**Implementation:**
- Visual badges representing each learning principle
- Appears alongside AI messages in chat
- Tooltip explanations on hover
- Animated entrance when principles are activated

**Features:**
- Color-coded by principle type
- Intensity indicator showing strength of principle application
- Clickable for detailed explanation
- Filters to show messages by principle

### 4. Instructor Tweaking Interface

**Component:** 21st.dev SettingsModal with MagicUI Interactive Elements

**Implementation:**
- Comprehensive controls for customizing DrLeeGPT behavior
- Real-time preview of changes
- Preset configurations for common teaching scenarios
- Save and share functionality for custom configurations

**Features:**
- Guided customization wizard for new users
- Advanced mode for detailed adjustments
- A/B testing capability for comparing configurations
- Analytics on effectiveness of different settings

## Responsive Behavior

**Breakpoints:**
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

**Adaptations:**
- Desktop: Side panels visible, full feature set
- Tablet: Collapsible panels, optimized controls
- Mobile: Full-screen chat, panels as modal overlays

**Mobile Optimizations:**
- Touch-friendly controls with increased tap targets
- Simplified animations for performance
- Bottom navigation for key actions
- Swipe gestures for panel access

## Microinteractions

1. **Copy Button:**
   - Initial state: Copy icon
   - Hover: Subtle glow effect
   - Click: Ripple animation → checkmark icon → return to copy icon
   - Toast notification: "Copied to clipboard!"

2. **Control Adjustments:**
   - Slider movement causes real-time updates in preview
   - Toggle switches with smooth animation and haptic feedback on mobile
   - Settings changes trigger subtle pulse animation in affected preview areas

3. **Chat Interface:**
   - Typing indicator with realistic rhythm
   - Message entrance animations (slide and fade)
   - Send button transforms during processing
   - Learning principle badges appear with subtle pop animation

4. **Navigation:**
   - Smooth transitions between panels
   - Active section highlighting in navigation
   - Breadcrumb trail animation for multi-step processes
   - Hover states with MagicUI BorderBeam effect

## Implementation Notes for Windsurf

1. **Component Libraries:**
   - Import 21st.dev components for structural elements
   - Import MagicUI for animations and microinteractions
   - Ensure all components support React 18+

2. **State Management:**
   - Use React context for global state (theme, user preferences)
   - Local state for component-specific interactions
   - Consider Redux for complex state management if needed

3. **API Integration:**
   - Follow provided code example for LearnLM integration
   - Implement proper error handling and loading states
   - Add caching for improved performance
   - Support streaming responses for realistic typing effect

4. **Accessibility:**
   - Ensure all interactive elements have proper ARIA labels
   - Maintain contrast ratios for text readability
   - Provide keyboard navigation alternatives
   - Include reduced motion options for animations

5. **Performance Considerations:**
   - Optimize animations for lower-end devices
   - Implement proper code splitting
   - Use image optimization for visual elements
   - Minimize layout shifts during interactions

## Code Snippets

### Main Chat Interface with Marketing Tab

```jsx
import { ChatInterface, MessageList, InputArea, TabPanel } from '21st/components';
import { SplashCursor, MessageBubble, TypingIndicator } from 'magicui/chat';
import { useState } from 'react';

function DrLeeGPTChat({ conversation, sendMessage, isTyping }) {
  const [activeTab, setActiveTab] = useState('chat');
  
  return (
    <div className="flex flex-col h-screen">
      <header className="h-16 border-b flex items-center justify-between px-4">
        <div className="flex items-center">
          <img src="/logo.svg" alt="DrLeeGPT" className="h-8 w-8 mr-2" />
          <h1 className="text-lg font-semibold">DrLeeGPT</h1>
        </div>
        
        <div className="flex items-center">
          <div className="border-b border-transparent px-4 py-2 mr-2">
            <button 
              className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'chat' 
                ? 'bg-blue-100 text-blue-800' 
                : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button 
              className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'about' 
                ? 'bg-blue-100 text-blue-800' 
                : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('about')}
            >
              About DrLeeGPT
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100" onClick={toggleExamplesPanel}>
              <span className="sr-only">Examples</span>
              <BookOpenIcon className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100" onClick={toggleSettingsPanel}>
              <span className="sr-only">Settings</span>
              <CogIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      
      <SplashCursor 
        color="conic-gradient(from 0deg, #3B82F6, #8B5CF6)"
        size={40}
        duration={1000}
        trailEffect={true}
      />
      
      <TabPanel value={activeTab} className="flex-1 overflow-hidden">
        <TabPanel.Item value="chat">
          <ChatInterface className="h-full flex flex-col">
            <MessageList className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversation.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  sender={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  principles={message.principles}
                  className={message.role === 'user' ? 'ml-auto bg-blue-500 text-white' : 'bg-gray-100'}
                />
              ))}
              {isTyping && <TypingIndicator />}
            </MessageList>
            
            <InputArea
              onSend={sendMessage}
              placeholder="Ask DrLeeGPT anything..."
              attachmentOptions={['image', 'audio', 'file']}
              voiceInput={true}
              className="border-t p-4"
            />
          </ChatInterface>
        </TabPanel.Item>
        
        <TabPanel.Item value="about">
          <div className="h-full overflow-y-auto p-6">
            <MarketingContent />
          </div>
        </TabPanel.Item>
      </TabPanel>
    </div>
  );
}

function MarketingContent() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">DrLeeGPT: AI-Powered Learning Assistant</h2>
      
      <div className="prose prose-blue max-w-none">
        <p className="text-xl text-gray-600 mb-8">
          Harness the power of LearnLM to transform educational experiences with an AI assistant built on learning science principles.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <FeatureCard 
            icon={<BrainIcon className="h-8 w-8 text-blue-500" />}
            title="Inspiring Active Learning"
            description="Encourages practice and healthy struggle with timely feedback to deepen understanding."
          />
          <FeatureCard 
            icon={<LayersIcon className="h-8 w-8 text-purple-500" />}
            title="Managing Cognitive Load"
            description="Presents relevant, well-structured information in multiple modalities."
          />
          <FeatureCard 
            icon={<UserIcon className="h-8 w-8 text-green-500" />}
            title="Adapting to the Learner"
            description="Dynamically adjusts to goals and needs, grounding in relevant materials."
          />
        </div>
        
        {/* Additional marketing sections would go here */}
      </div>
      
      <div className="mt-12 border-t pt-8">
        <h3 className="text-2xl font-semibold mb-4">Ready to enhance your teaching?</h3>
        <p className="mb-6">Share DrLeeGPT with colleagues or explore advanced features.</p>
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Share DrLeeGPT
          </button>
          <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
            Explore Plans
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
```

### Examples Panel

```jsx
import { DrawerPanel, CodeBlock, TabGroup } from '21st/components';
import { CopyButton, Button } from 'magicui/controls';
import { useToast } from 'magicui/feedback';

function ExamplesPanel({ isOpen, onClose, onUseExample }) {
  const { toast } = useToast();
  const categories = ['Test Prep', 'Teach a Concept', 'Releveling', 'Learning Activity', 'Homework Help'];
  
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "You can now paste this into DrLeeGPT",
      variant: "success",
      duration: 3000,
    });
  };
  
  return (
    <DrawerPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Example Prompts"
      position="right"
      width="400px"
      className="bg-white shadow-lg"
    >
      <TabGroup
        tabs={categories}
        className="mt-4"
        variant="underline"
      >
        {/* Test Prep Tab */}
        <div className="p-4 space-y-6">
          <div className="example-card rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold">Test Prep</h3>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500">System Instruction:</h4>
              <div className="relative mt-1">
                <CodeBlock
                  language="markdown"
                  code="You are a tutor helping a student prepare for a test. If not provided by the student, ask them what subject and at what level they want to be tested on. Then, generate practice questions..."
                  theme="light"
                  className="rounded-md text-sm max-h-40 overflow-y-auto"
                />
                <CopyButton 
                  onClick={() => handleCopy("System instruction text...")}
                  className="absolute top-2 right-2"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500">User Prompt:</h4>
              <div className="relative mt-1">
                <CodeBlock
                  language="markdown"
                  code="Help me study for a high school biology test on ecosystems"
                  theme="light"
                  className="rounded-md text-sm"
                />
                <CopyButton 
                  onClick={() => handleCopy("Help me study for a high school biology test on ecosystems")}
                  className="absolute top-2 right-2"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500">Learning Principles:</h4>
              <div className="flex gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Adaptivity
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active Learning
                </span>
              </div>
            </div>
            
            <Button
              onClick={() => onUseExample({
                systemInstruction: "System instruction text...",
                userPrompt: "Help me study for a high school biology test on ecosystems"
              })}
              className="w-full mt-4"
              variant="outline"
            >
              Try This Example
            </Button>
          </div>
          
          {/* Additional examples would go here */}
        </div>
        
        {/* Other category tabs would go here */}
      </TabGroup>
    </DrawerPanel>
  );
}
```

### Instructor Controls

```jsx
import { SettingsModal, FormGroup } from '21st/components';
import { Slider, Toggle, TextArea, Button } from 'magicui/controls';

function InstructorControls({ isOpen, onClose, config, setConfig, previewRef }) {
  const updateConfig = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    // Update preview in real-time
    if (previewRef.current) {
      previewRef.current.updateWithConfig(newConfig);
    }
  };
  
  return (
    <SettingsModal
      isOpen={isOpen}
      onClose={onClose}
      title="Customize DrLeeGPT"
      description="Adjust how DrLeeGPT interacts with your students"
      className="max-w-3xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="space-y-6">
          <FormGroup label="System Instruction" description="Customize the base instruction for DrLeeGPT">
            <TextArea
              value={config.systemInstruction}
              onChange={(e) => updateConfig('systemInstruction', e.target.value)}
              className="w-full h-40 font-mono text-sm"
              placeholder="Enter custom system instruction..."
            />
          </FormGroup>
          
          <FormGroup label="Teaching Style" description="Adjust how DrLeeGPT approaches instruction">
            <Slider
              min={1}
              max={10}
              step={1}
              value={config.teachingStyle}
              onChange={(value) => updateConfig('teachingStyle', value)}
              labels={['Socratic', 'Direct']}
              showValue
            />
          </FormGroup>
          
          <FormGroup label="Content Presentation" description="Control how information is presented">
            <div className="space-y-3">
              <Toggle
                label="Include examples"
                checked={config.includeExamples}
                onChange={(checked) => updateConfig('includeExamples', checked)}
              />
              <Toggle
                label="Visual aids"
                checked={config.visualAids}
                onChange={(checked) => updateConfig('visualAids', checked)}
              />
              <Toggle
                label="Step-by-step breakdowns"
                checked={config.stepByStep}
                onChange={(checked) => updateConfig('stepByStep', checked)}
              />
            </div>
          </FormGroup>
        </div>
        
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Preview</h3>
          <div 
            ref={previewRef}
            className="bg-white rounded border p-3 h-[400px] overflow-y-auto"
          >
            {/* Preview content would render here */}
            <div className="text-sm text-gray-500">
              Preview of DrLeeGPT with your current settings
            </div>
          </div>
          
          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={() => setConfig(defaultConfig)}>
              Reset to Default
            </Button>
            <Button onClick={() => saveConfig(config)}>
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
      
      <div className="border-t p-4 flex justify-between">
        <Toggle
          label="Student View"
          checked={config.studentView}
          onChange={(checked) => updateConfig('studentView', checked)}
        />
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </SettingsModal>
  );
}
```

This specification provides a comprehensive framework for implementing the DrLeeGPT page within the LearningScience platform, focusing on the core chat experience while making supporting features easily accessible. The design includes marketing and sales information in a non-intrusive tab, allowing users to access it when needed without disrupting the main experience. The specification uses modern UI components from 21st.dev and MagicUI, incorporates copyable example prompts, learning principle visualization, and instructor customization controls.

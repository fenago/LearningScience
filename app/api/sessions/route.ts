import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import Session from '@/models/Session';
import { v4 as uuidv4 } from 'uuid';

// Session interface for Phase 5A
interface SessionRequest {
  learningMode: 'Learn' | 'Explore' | 'Create' | 'Assess';
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    language?: string;
  };
}

// POST /api/sessions - Create new session
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { learningMode, deviceInfo }: SessionRequest = await req.json();
    
    if (!learningMode || !['Learn', 'Explore', 'Create', 'Assess'].includes(learningMode)) {
      return NextResponse.json({ error: 'Valid learningMode required' }, { status: 400 });
    }

    await connectMongo();

    // End any existing active sessions for this user
    await Session.updateMany(
      { userId: session.user.email, isActive: true },
      { $set: { isActive: false, endTime: new Date() } }
    );

    // Create new session
    const newSession = await Session.create({
      sessionId: uuidv4(),
      userId: session.user.email,
      learningMode,
      messageCount: 0,
      metadata: {
        deviceInfo: deviceInfo || {},
        performance: {
          initTime: Date.now(),
          avgResponseTime: 0,
        },
      },
    });

    return NextResponse.json({
      sessionId: newSession.sessionId,
      learningMode: newSession.learningMode,
      startTime: newSession.startTime,
      messageCount: newSession.messageCount,
    });

  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/sessions - Get user's recent sessions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectMongo();
    
    // Get user's recent sessions (last 10)
    const sessions = await Session.find({ userId: session.user.email })
      .sort({ startTime: -1 })
      .limit(10)
      .select('sessionId learningMode startTime endTime messageCount isActive')
      .lean();

    return NextResponse.json({ sessions });

  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

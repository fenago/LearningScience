import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import Session from '@/models/Session';

// GET /api/sessions/[sessionId] - Retrieve specific session
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { sessionId } = params;
    
    await connectMongo();
    
    // Find session belonging to current user
    const sessionData = await Session.findOne({
      sessionId,
      userId: session.user.email
    }).lean();
    
    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    return NextResponse.json({ session: sessionData });

  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/sessions/[sessionId] - Update session activity
export async function PUT(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { sessionId } = params;
    const body = await req.json();
    const { action, messageCount, batchData, operationIds } = body;
    
    await connectMongo();
    
    // Phase 5B: Handle batch updates
    if (action === 'batch_update' && batchData) {
      const updateData: any = {
        lastActivity: batchData.lastActivity || new Date()
      };
      
      // Apply consolidated batch data
      if (batchData.messageCount !== undefined) {
        updateData.messageCount = batchData.messageCount;
      }
      if (batchData.isActive !== undefined) {
        updateData.isActive = batchData.isActive;
      }
      if (batchData.endTime) {
        updateData.endTime = new Date(batchData.endTime);
      }
      if (batchData.metadata) {
        updateData['metadata.performance'] = batchData.metadata;
      }
      
      const updatedSession = await Session.findOneAndUpdate(
        { sessionId, userId: session.user.email },
        updateData,
        { new: true, lean: true }
      );
      
      if (!updatedSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      
      return NextResponse.json({ 
        session: updatedSession,
        batchProcessed: true,
        operationsCount: operationIds?.length || 0,
        operationIds
      });
    }
    
    // Legacy single operation handling
    let updateData: any = {
      lastActivity: new Date()
    };

    switch (action) {
      case 'message_sent':
        if (typeof messageCount === 'number') {
          updateData.messageCount = messageCount;
        } else {
          updateData.$inc = { messageCount: 1 };
        }
        break;
      case 'heartbeat':
        // Just update lastActivity
        break;
      case 'end_session':
        updateData.isActive = false;
        updateData.endTime = new Date();
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    const updatedSession = await Session.findOneAndUpdate(
      { sessionId, userId: session.user.email },
      updateData,
      { new: true, lean: true }
    );
    
    if (!updatedSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      session: updatedSession,
      updated: true 
    });
    
  } catch (error) {
    console.error('Session update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

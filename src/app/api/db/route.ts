import { NextResponse } from 'next/server';
import { 
  getFamilyState,
  addMemberDb,
  updateMemberDb,
  deleteMemberDb,
  addRelationshipDb,
  deleteRelationshipDb,
  addParentChildRelationDb,
  deleteParentChildRelationDb,
  addEventDb,
  deleteEventDb,
  addAnnouncementDb,
  deleteAnnouncementDb,
  addGuestbookDb,
  deleteGuestbookDb
} from '@/lib/db';

export async function GET() {
  try {
    const state = getFamilyState();
    return NextResponse.json(state);
  } catch (error: any) {
    console.error('API GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, payload } = await request.json();

    switch (action) {
      case 'addMember':
        addMemberDb(payload);
        break;
      case 'updateMember':
        updateMemberDb(payload.id, payload.fields);
        break;
      case 'deleteMember':
        deleteMemberDb(payload.id);
        break;
      case 'addRelationship':
        addRelationshipDb(payload);
        break;
      case 'deleteRelationship':
        deleteRelationshipDb(payload.id);
        break;
      case 'addParentChildRelation':
        addParentChildRelationDb(payload.parentId, payload.childId);
        break;
      case 'deleteParentChildRelation':
        deleteParentChildRelationDb(payload.parentId, payload.childId);
        break;
      case 'addEvent':
        addEventDb(payload);
        break;
      case 'deleteEvent':
        deleteEventDb(payload.id);
        break;
      case 'addAnnouncement':
        addAnnouncementDb(payload);
        break;
      case 'deleteAnnouncement':
        deleteAnnouncementDb(payload.id);
        break;
      case 'addGuestbook':
        addGuestbookDb(payload);
        break;
      case 'deleteGuestbook':
        deleteGuestbookDb(payload.id);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Ambil state terbaru setelah mutasi
    const state = getFamilyState();
    return NextResponse.json(state);
  } catch (error: any) {
    console.error('API POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface ContactSubmission {
  id: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

// Read all contacts
async function readContacts(): Promise<ContactSubmission[]> {
  try {
    const data = await fs.readFile(CONTACTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write contacts
async function writeContacts(contacts: ContactSubmission[]) {
  await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
}

// Verify admin token
function verifyAdmin(request: NextRequest): boolean {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-key';
  return token === adminToken;
}

// GET - Fetch all contacts
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contacts = await readContacts();
    return NextResponse.json({ contacts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

// PUT - Mark as read
export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    const contacts = await readContacts();
    
    const contact = contacts.find(c => c.id === id);
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    contact.read = true;
    await writeContacts(contacts);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

// DELETE - Delete a contact
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    const contacts = await readContacts();
    
    const filtered = contacts.filter(c => c.id !== id);
    if (filtered.length === contacts.length) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    await writeContacts(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}

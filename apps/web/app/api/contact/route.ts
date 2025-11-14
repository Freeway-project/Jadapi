import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Read all contacts
async function readContacts(): Promise<ContactSubmission[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(CONTACTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write contacts
async function writeContacts(contacts: ContactSubmission[]) {
  await ensureDataDir();
  await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, mobile, message } = body;

    // Validate
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email and message are required' },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Create new submission
    const submission: ContactSubmission = {
      id: Date.now().toString(),
      name,
      email,
      mobile,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };

    // Read existing
    const contacts = await readContacts();
    contacts.push(submission);

    // Write back
    await writeContacts(contacts);

    return NextResponse.json(
      { success: true, id: submission.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

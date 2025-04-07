import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// not using this

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get('file') || 'lesson-1.xlsx'; 
  const filePath = path.join(process.cwd(), 'public/lessons', fileName);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Lesson file not found' }, { status: 404 });
  }

  const file = fs.readFileSync(filePath);
  const workbook = XLSX.read(file, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  return NextResponse.json({ data });
}

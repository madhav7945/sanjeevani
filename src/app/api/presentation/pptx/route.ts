import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'Sanjeevani_Master_Presentation.pptx');
  
  if (!fs.existsSync(filePath)) {
    return new NextResponse('Presentation file not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': 'attachment; filename="Sanjeevani_Master_Presentation.pptx"',
      'Content-Length': fileBuffer.length.toString(),
    },
  });
}

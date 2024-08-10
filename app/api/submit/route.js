import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const phoneNo = formData.get("phoneNo");
    const birthDate = formData.get("birthDate");
    const email = formData.get("email");
    const photo = formData.get("photo");

    // Generate Date of Joining (2 years from now)
    const dateOfJoining = new Date();
    dateOfJoining.setFullYear(dateOfJoining.getFullYear() + 2);

    // Generate PDF
    const pdfBytes = await generatePDF(
      name,
      phoneNo,
      birthDate,
      dateOfJoining.toISOString().split("T")[0],
      photo
    );

    // Save the generated PDF
    await savePDF(pdfBytes);

    // Send email
    await sendEmail(name, email, pdfBytes);

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Error occurred" }, { status: 500 });
  }
}

async function generatePDF(name, phoneNo, birthDate, dateOfJoining, photo) {
  const templatePath = path.join(process.cwd(), "public", "template.pdf");
  const templatePdfBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(templatePdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  const textColor = rgb(0, 0, 0); // Black color
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const color = {
    r: 15 / 255,
    g: 17 / 255,
    b: 118 / 255,
  };

  // Positioning constants
  const leftMargin = 18;
  const bottomMargin = 45.5;
  const lineSpacing = 13;

  // Draw name
  firstPage.drawText(name, {
    x: leftMargin,
    y: bottomMargin + lineSpacing * 3,
    size: 6,
    font: boldFont,
    color: rgb(color.r, color.g, color.b),
  });

  // Draw phone number
  firstPage.drawText(phoneNo, {
    x: leftMargin,
    y: bottomMargin + lineSpacing * 2,
    size: 6,
    font: boldFont,
    color: rgb(color.r, color.g, color.b),
  });

  // Draw DOB
  firstPage.drawText(`DOB: ${birthDate}`, {
    x: leftMargin + 65,
    y: bottomMargin + lineSpacing * 2,
    size: 6,
    font: boldFont,
    color: rgb(color.r, color.g, color.b),
  });

  // Add photo if provided
  if (photo) {
    const photoBytes = await photo.arrayBuffer();
    const image = await pdfDoc.embedJpg(photoBytes);
    const scaleFactor = 0.1; // Adjust this value to change the size of the photo
    const imageDims = image.scale(scaleFactor);
    firstPage.drawImage(image, {
      x: width - imageDims.width - -3,
      y: height - imageDims.height - 42,
      width: 54,
      height: 64,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

async function savePDF(pdfBytes) {
  const filePath = path.join(process.cwd(), "public", "generated_template.pdf");
  await fs.writeFile(filePath, pdfBytes);
}

async function sendEmail(name, email, pdfBytes) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "shashankphatkurepro@gmail.com",
      pass: "bkqa fpqn wvab ojdi",
    },
  });

  const mailOptions = {
    from: "shashankphatkurepro@gmail.com",
    to: email,
    subject: "Your Nirnay Foundation ID Card",
    text: `Dear ${name},\n\nPlease find attached your Nirnay Foundation ID card.\n\nBest regards,\nNirnay Foundation`,
    attachments: [
      {
        filename: "nirnay_foundation_id_card.pdf",
        content: Buffer.from(pdfBytes),
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

// Test function to generate a sample PDF
export async function GET() {
  try {
    const sampleData = {
      name: "John Doe",
      phoneNo: "123-456-7890",
      birthDate: "1990-01-01",
      dateOfJoining: "2025-05-15",
    };
    const pdfBytes = await generatePDF(
      sampleData.name,
      sampleData.phoneNo,
      sampleData.birthDate,
      sampleData.dateOfJoining
    );
    await savePDF(pdfBytes);
    return NextResponse.json(
      { message: "Test PDF generated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating test PDF:", error);
    return NextResponse.json(
      { message: "Error generating test PDF" },
      { status: 500 }
    );
  }
}

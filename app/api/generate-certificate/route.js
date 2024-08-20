// app/api/generate-certificate/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";
import { put, get } from "@vercel/blob";
import fetch from "node-fetch";

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nirnayfoundationid@gmail.com",
    pass: "ojch oayg qvjx vkfc",
  },
});

export async function POST(request) {
  try {
    const { name, email, designation, date } = await request.json();

    // Load the PDF template
    const templatePath = path.join(
      process.cwd(),
      "public",
      "certificate_template.pdf"
    );
    const templatePdfBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templatePdfBytes);

    // Register fontkit
    pdfDoc.registerFontkit(fontkit);

    // Embed the Montserrat-Bold font
    const fontPath = path.join(process.cwd(), "public", "Montserrat-Bold.ttf");
    const fontBytes = await fs.readFile(fontPath);
    const montserratBoldFont = await pdfDoc.embedFont(fontBytes);

    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Convert #0f1176 to RGB values (normalized to 0-1 range)
    const color = {
      r: 15 / 255,
      g: 17 / 255,
      b: 118 / 255,
    };

    // Function to draw centered text
    const drawCenteredText = (text, y, fontSize) => {
      const textWidth = montserratBoldFont.widthOfTextAtSize(text, fontSize);
      const x = (width - textWidth) / 2;
      firstPage.drawText(text, {
        x,
        y,
        size: fontSize,
        font: montserratBoldFont,
        color: rgb(color.r, color.g, color.b),
      });
    };

    // Right-align the designation
    const designationWidth = montserratBoldFont.widthOfTextAtSize(
      designation,
      16
    );
    const designationX = width - designationWidth - 540; // 20 is right margin
    firstPage.drawText(designation, {
      x: designationX,
      y: 225,
      size: 16,
      font: montserratBoldFont,
      color: rgb(color.r, color.g, color.b),
    });

    firstPage.drawText(date, {
      x: 205,
      y: 115,
      size: 14,
      font: montserratBoldFont,
      color: rgb(color.r, color.g, color.b),
    });

    // Add centered text to the PDF
    drawCenteredText(name, 285, 30);

    // // Save the PDF
    // const pdfBytes = await pdfDoc.save();
    // const outputPath = path.join(
    //   process.cwd(),
    //   "public",
    //   "generated_certificate.pdf"
    // );
    // await fs.writeFile(outputPath, pdfBytes);

    const blob = await put(
      `certificates/${name}-${Date.now()}.pdf`,
      await pdfDoc.save(),
      {
        access: "public",
      }
    );

    // CHANGE: Download the PDF from Vercel Blob
    const response = await fetch(blob.url);
    const pdfBuffer = await response.buffer();

    // Send email with attachment
    const mailOptions = {
      from: "shashankphatkurepro@gmail.com",
      to: email,
      subject: "Your Generated Certificate",
      text: "Please find your generated certificate attached.",
      attachments: [
        {
          filename: `${name}_certificate.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: "Certificate generated and sent successfully!",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while generating the certificate." },
      { status: 500 }
    );
  }
}

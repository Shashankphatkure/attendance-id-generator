// app/certificate-generator/page.js
"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function CertificateGenerator() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "",
    date: "",
  });

  const [certificateUrl, setCertificateUrl] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/generate-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        // CHANGE: Store the certificate URL from the response
        setCertificateUrl(result.url);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while generating the certificate.");
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>Certificate Generator</h1>
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleInputChange}
        />
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleInputChange}
        />
        <label htmlFor="designation">Designation</label>
        <input
          type="text"
          id="designation"
          name="designation"
          required
          placeholder="Enter your designation"
          value={formData.designation}
          onChange={handleInputChange}
        />
        <label htmlFor="date">Certificate Date</label>
        <input
          type="date"
          id="date"
          name="date"
          required
          value={formData.date}
          onChange={handleInputChange}
        />
        <button type="submit">Generate Certificate</button>
      </form>
      {certificateUrl && (
        <p>
          Your certificate is ready!{" "}
          <a href={certificateUrl} target="_blank" rel="noopener noreferrer">
            View Certificate
          </a>
        </p>
      )}
    </div>
  );
}

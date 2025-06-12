import jsPDF from "jspdf";
import "jspdf-autotable";

export function generateUserDataPDF(userData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Helper function to check if we need a new page
  const checkPageBreak = (neededSpace = 20) => {
    if (yPosition + neededSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Colors from your design system
  const colors = {
    primary: [1, 28, 45], // #011C2D
    accent: [180, 44, 81], // #B42C51
    secondary: [245, 247, 244], // #F5F7F4
    text: [51, 51, 51], // #333333
  };

  // Header
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Personal Data Report", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated on ${new Date().toLocaleDateString("en-GB")}`,
    pageWidth / 2,
    32,
    { align: "center" },
  );

  yPosition = 50;

  // Personal Information Section
  doc.setTextColor(...colors.text);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Personal Information", 20, yPosition);
  yPosition += 10;

  const personalInfo = userData.personal_information;

  // Create info boxes
  const infoItems = [
    ["Username", personalInfo.username],
    ["Email", personalInfo.email],
    [
      "Account Type",
      personalInfo.role.charAt(0).toUpperCase() + personalInfo.role.slice(1),
    ],
    [
      "Member Since",
      new Date(personalInfo.entry_date).toLocaleDateString("en-GB"),
    ],
  ];

  doc.setFontSize(10);
  let xPosition = 20;
  const boxWidth = (pageWidth - 60) / 2;
  const boxHeight = 15;

  infoItems.forEach((item, index) => {
    if (index % 2 === 0) {
      xPosition = 20;
      if (index > 0) yPosition += boxHeight + 5;
    } else {
      xPosition = 30 + boxWidth;
    }

    checkPageBreak(boxHeight + 5);

    // Draw box
    doc.setFillColor(248, 249, 250);
    doc.rect(xPosition, yPosition, boxWidth, boxHeight, "F");
    doc.setDrawColor(233, 236, 239);
    doc.rect(xPosition, yPosition, boxWidth, boxHeight, "S");

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(108, 117, 125);
    doc.text(item[0].toUpperCase(), xPosition + 3, yPosition + 5);

    // Value
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...colors.text);
    doc.text(item[1], xPosition + 3, yPosition + 11);
  });

  yPosition += boxHeight + 20;
  checkPageBreak(30);

  // Learning Summary
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.text);
  doc.text("Learning Overview", 20, yPosition);
  yPosition += 15;

  const totalSpent = userData.course_enrollments.reduce(
    (sum, course) => sum + parseFloat(course.price),
    0,
  );
  const completedCourses = userData.course_enrollments.filter(
    (e) => e.progress === 100,
  ).length;

  const stats = [
    ["Courses Purchased", userData.course_enrollments.length],
    ["Total Investment", `£${totalSpent.toFixed(2)}`],
    ["Courses Completed", completedCourses],
    ["Lessons Finished", userData.learning_progress.total_lessons_completed],
  ];

  const statBoxWidth = (pageWidth - 100) / 4;
  stats.forEach((stat, index) => {
    const statX = 20 + (statBoxWidth + 5) * index;

    // Stat box
    doc.setFillColor(255, 255, 255);
    doc.rect(statX, yPosition, statBoxWidth, 25, "F");
    doc.setDrawColor(...colors.accent);
    doc.setLineWidth(0.5);
    doc.rect(statX, yPosition, statBoxWidth, 25, "S");

    // Number/Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...colors.accent);
    doc.text(stat[1].toString(), statX + statBoxWidth / 2, yPosition + 10, {
      align: "center",
    });

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...colors.text);
    doc.text(stat[0].toUpperCase(), statX + statBoxWidth / 2, yPosition + 18, {
      align: "center",
    });
  });

  yPosition += 35;
  checkPageBreak(50);

  // Purchased Courses Section
  if (userData.course_enrollments.length > 0) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.text);
    doc.text("Purchased Courses", 20, yPosition);
    yPosition += 5;

    // Add subtitle
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(108, 117, 125);
    doc.text(
      `You have purchased ${userData.course_enrollments.length} course${userData.course_enrollments.length !== 1 ? "s" : ""} on our platform`,
      20,
      yPosition,
    );
    yPosition += 10;

    const tableData = userData.course_enrollments.map((course) => {
      const enrolledDate = new Date(course.enrolled_at).toLocaleDateString(
        "en-GB",
      );
      const progressText =
        course.progress === 100
          ? "Completed ✓"
          : `${course.progress || 0}% complete`;
      const statusText = course.status === "ACTIVE" ? "Active" : course.status;

      return [
        course.course_title,
        course.instructor_name,
        `£${course.price}`,
        enrolledDate,
        progressText,
        statusText,
      ];
    });

    doc.autoTable({
      startY: yPosition,
      head: [
        [
          "Course Title",
          "Instructor",
          "Price Paid",
          "Purchase Date",
          "Progress",
          "Status",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: colors.accent,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 8,
        textColor: colors.text,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      columnStyles: {
        0: { cellWidth: "auto" }, // Course title - flexible
        1: { cellWidth: 35 }, // Instructor
        2: { cellWidth: 25 }, // Price
        3: { cellWidth: 30 }, // Date
        4: { cellWidth: 30 }, // Progress
        5: { cellWidth: 25 }, // Status
      },
      margin: { left: 20, right: 20 },
      didDrawCell: function (data) {
        // Highlight completed courses
        if (
          data.column.index === 4 &&
          data.cell.text[0].includes("Completed")
        ) {
          doc.setTextColor(...colors.accent);
          doc.setFont("helvetica", "bold");
        }
      },
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Add purchase summary
    const totalSpent = userData.course_enrollments.reduce(
      (sum, course) => sum + parseFloat(course.price),
      0,
    );
    const completedCourses = userData.course_enrollments.filter(
      (course) => course.progress === 100,
    ).length;

    checkPageBreak(25);

    doc.setFillColor(245, 247, 244);
    doc.rect(20, yPosition, pageWidth - 40, 20, "F");
    doc.setDrawColor(...colors.accent);
    doc.rect(20, yPosition, pageWidth - 40, 20, "S");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.text);
    doc.text(`Purchase Summary:`, 25, yPosition + 7);
    doc.text(`Total Spent: £${totalSpent.toFixed(2)}`, 25, yPosition + 15);

    doc.text(
      `Courses Completed: ${completedCourses}/${userData.course_enrollments.length}`,
      pageWidth / 2 + 20,
      yPosition + 7,
    );
    doc.text(
      `Success Rate: ${userData.course_enrollments.length > 0 ? Math.round((completedCourses / userData.course_enrollments.length) * 100) : 0}%`,
      pageWidth / 2 + 20,
      yPosition + 15,
    );

    yPosition += 30;
  } else {
    // No purchases section
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.text);
    doc.text("Purchased Courses", 20, yPosition);
    yPosition += 10;

    doc.setFillColor(255, 249, 196);
    doc.rect(20, yPosition, pageWidth - 40, 25, "F");
    doc.setDrawColor(255, 193, 7);
    doc.rect(20, yPosition, pageWidth - 40, 25, "S");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(133, 100, 4);
    doc.text("You have not purchased any courses yet.", 25, yPosition + 8);
    doc.text(
      "Visit our course catalog to start your learning journey!",
      25,
      yPosition + 16,
    );

    yPosition += 35;
  }

  // Detailed Learning Progress (if user has progress)
  if (userData.learning_progress.progress_records.length > 0) {
    checkPageBreak(40);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.text);
    doc.text("Detailed Learning Progress", 20, yPosition);
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(108, 117, 125);
    doc.text(`Showing recent progress across all courses`, 20, yPosition);
    yPosition += 10;

    // Group progress by course
    const progressByCourse = {};
    userData.learning_progress.progress_records.forEach((record) => {
      if (!progressByCourse[record.course_title]) {
        progressByCourse[record.course_title] = [];
      }
      progressByCourse[record.course_title].push(record);
    });

    // Show progress for each course
    Object.entries(progressByCourse)
      .slice(0, 3)
      .forEach(([courseTitle, records]) => {
        checkPageBreak(30);

        const completedLessons = records.filter((r) => r.completed).length;
        const totalLessons = records.length;
        const progressPercent = Math.round(
          (completedLessons / totalLessons) * 100,
        );

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...colors.text);
        doc.text(courseTitle, 20, yPosition);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(108, 117, 125);
        doc.text(
          `${completedLessons}/${totalLessons} lessons completed (${progressPercent}%)`,
          20,
          yPosition + 8,
        );

        // Progress bar
        const barWidth = 150;
        const barHeight = 6;
        const barX = 20;
        const barY = yPosition + 12;

        // Background
        doc.setFillColor(233, 236, 239);
        doc.rect(barX, barY, barWidth, barHeight, "F");

        // Progress
        doc.setFillColor(...colors.accent);
        doc.rect(
          barX,
          barY,
          (barWidth * progressPercent) / 100,
          barHeight,
          "F",
        );

        yPosition += 22;
      });

    if (Object.keys(progressByCourse).length > 3) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(108, 117, 125);
      doc.text(
        `... and ${Object.keys(progressByCourse).length - 3} more courses`,
        20,
        yPosition,
      );
      yPosition += 15;
    }
  }

  // Instructor Data (if applicable)
  if (
    personalInfo.role === "instructor" &&
    userData.instructor_data.courses_created.length > 0
  ) {
    checkPageBreak(50);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Instructor Dashboard", 20, yPosition);
    yPosition += 15;

    const instructorTableData = userData.instructor_data.courses_created.map(
      (course) => [
        course.title,
        `£${course.price}`,
        new Date(course.created_at).toLocaleDateString("en-GB"),
        course.published ? "Published" : "Draft",
      ],
    );

    doc.autoTable({
      startY: yPosition,
      head: [["Course Title", "Price", "Created", "Status"]],
      body: instructorTableData,
      theme: "grid",
      headStyles: {
        fillColor: colors.accent,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: colors.text,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // Footer
  const footerY = pageHeight - 25;
  doc.setFillColor(...colors.secondary);
  doc.rect(0, footerY - 5, pageWidth, 30, "F");

  doc.setFontSize(8);
  doc.setTextColor(...colors.text);
  doc.text(
    "This report contains all personal data processed about you as required by GDPR.",
    pageWidth / 2,
    footerY + 5,
    { align: "center" },
  );
  doc.text(
    `Report ID: ${userData.export_info.user_id}-${Date.now()}`,
    pageWidth / 2,
    footerY + 12,
    { align: "center" },
  );

  return doc.output("arraybuffer");
}

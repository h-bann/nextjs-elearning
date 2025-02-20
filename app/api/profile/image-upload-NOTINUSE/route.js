// // Image upload route
// export async function POST(req) {
//   try {
//     const cookieStore = cookies();
//     const token = cookieStore.get("auth_token")?.value;

//     if (!token) {
//       return Response.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const formData = await req.formData();
//     const file = formData.get("image");

//     if (!file) {
//       return Response.json({ message: "No image provided" }, { status: 400 });
//     }

//     // Create unique filename
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);
//     const filename = `${decoded.userId}-${Date.now()}.${
//       file.type.split("/")[1]
//     }`;
//     const path = join(process.cwd(), "public", "uploads", filename);

//     // Save file
//     await writeFile(path, buffer);

//     // Update user profile with image URL
//     const imageUrl = `/uploads/${filename}`;
//     await query("UPDATE users SET image = ? WHERE id = ?", [
//       imageUrl,
//       decoded.userId,
//     ]);

//     return Response.json(
//       {
//         message: "Image uploaded successfully",
//         imageUrl,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Image upload error:", error);
//     return Response.json({ message: "Internal server error" }, { status: 500 });
//   }
// }

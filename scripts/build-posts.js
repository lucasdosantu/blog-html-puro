const fs = require("fs");
const path = require("path");

const POSTS_DIR = path.join(__dirname, "../posts");
const OUTPUT_FILE = path.join(__dirname, "../posts.json");

function parseMarkdownHeader(content, fileName) {
  const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
  const dateFromFileName = dateMatch
    ? dateMatch[1]
    : new Date().toISOString().split("T")[0];

  const titleMatch = content.match(/^#\s+(.+)$/m);
  let title = titleMatch ? titleMatch[1].trim() : "";

  if (!title) {
    const nameWithoutDate = fileName
      .replace(/^\d{4}-\d{2}-\d{2}-/, "")
      .replace(/\.md$/, "");
    title = nameWithoutDate
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  const cleanContent = content.replace(/^#\s+.+$/m, "").trim();
  const summary = cleanContent.slice(0, 150).replace(/[\r\n]+/g, " ") + "...";

  const slug = fileName.replace(/\.md$/, "");

  return {
    slug,
    title,
    date: dateFromFileName,
    file: `posts/${fileName}`,
    summary,
  };
}

function buildPostsJson() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error("A pasta /posts não existe.");
    process.exit(1);
  }

  const files = fs.readdirSync(POSTS_DIR);
  const mdFiles = files.filter((file) => file.endsWith(".md"));

  const posts = mdFiles.map((file) => {
    const filePath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    return parseMarkdownHeader(content, file);
  });

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2), "utf-8");
  console.log(
    `✅ posts.json gerado com sucesso! Total: ${posts.length} posts.`,
  );
}

buildPostsJson();

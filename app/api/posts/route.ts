import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIRECTORY = path.join(process.cwd(), 'content/posts');

// GET /api/posts - List all posts
export async function GET() {
  try {
    // Ensure the posts directory exists
    try {
      await fs.access(POSTS_DIRECTORY);
    } catch (error) {
      await fs.mkdir(POSTS_DIRECTORY, { recursive: true });
      return NextResponse.json({ posts: [] }); // Return empty array if directory was just created
    }

    // Get all .mdx files in the posts directory
    const files = await fs.readdir(POSTS_DIRECTORY);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));

    // Parse each file to extract metadata
    const posts = await Promise.all(
      mdxFiles.map(async (filename) => {
        // Extract slug and lang from filename pattern: slug.lang.mdx
        const filenameParts = filename.replace(/\.mdx$/, '').split('.');
        const lang = filenameParts.pop() || 'en'; // Default to 'en' if parsing fails
        const slug = filenameParts.join('.');

        const filePath = path.join(POSTS_DIRECTORY, filename);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const { data: metadata } = matter(fileContent);

        return {
          slug,
          lang,
          title: metadata.title || 'Untitled',
          date: metadata.date || new Date().toISOString().split('T')[0],
          published: metadata.published === true, // Ensure boolean, default false
        };
      })
    );

    // Sort posts by date, newest first
    posts.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Error listing posts:', error);
    return NextResponse.json(
      { message: `Error listing posts: ${error.message}`, posts: [] },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    // Ensure the posts directory exists
    try {
      await fs.access(POSTS_DIRECTORY);
    } catch (error) {
      await fs.mkdir(POSTS_DIRECTORY, { recursive: true });
    }

    // Parse the request body
    const { slug, lang, mdx } = await request.json();

    if (!slug || !lang || !mdx) {
      return NextResponse.json(
        { message: 'Missing required fields: slug, lang, or mdx' },
        { status: 400 }
      );
    }

    // Generate filename based on slug and language
    const fileName = `${slug}.${lang}.mdx`;
    const filePath = path.join(POSTS_DIRECTORY, fileName);

    // Check if file already exists
    try {
      await fs.access(filePath);
      return NextResponse.json(
        { message: `Post with slug "${slug}" in language "${lang}" already exists` },
        { status: 409 }
      );
    } catch (error) {
      // File doesn't exist, which is what we want
    }

    // Extract metadata from MDX
    const { data: metadata } = matter(mdx);
    
    // Write the MDX file
    await fs.writeFile(filePath, mdx, 'utf8');

    return NextResponse.json({
      message: 'Post created successfully',
      slug,
      lang,
      metadata,
      published: metadata.published === true,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { message: `Error creating post: ${error.message}` },
      { status: 500 }
    );
  }
} 
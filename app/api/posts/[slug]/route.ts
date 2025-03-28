import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIRECTORY = path.join(process.cwd(), 'content/posts');

// Helper to get file path
function getFilePath(slug: string, lang: string) {
  return path.join(POSTS_DIRECTORY, `${slug}.${lang}.mdx`);
}

// GET /api/posts/[slug] - Get a specific post
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Get language from query parameters
    const url = new URL(request.url);
    const lang = url.searchParams.get('lang') || 'en';
    
    if (!lang || (lang !== 'en' && lang !== 'pl')) {
      return NextResponse.json(
        { message: 'Invalid language parameter. Must be "en" or "pl".' },
        { status: 400 }
      );
    }
    
    // Ensure posts directory exists
    try {
      await fs.access(POSTS_DIRECTORY);
    } catch (error) {
      await fs.mkdir(POSTS_DIRECTORY, { recursive: true });
    }

    const filePath = getFilePath(slug, lang);

    try {
      // Try to access the file
      await fs.access(filePath);
    } catch (error) {
      return NextResponse.json(
        { message: `Post not found: ${slug} (${lang})` },
        { status: 404 }
      );
    }

    // Read the file
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // Parse frontmatter and content
    const { data: metadata, content } = matter(fileContent);

    return NextResponse.json({
      metadata,
      content: fileContent, // Return the full MDX file including frontmatter
    });
    
  } catch (error: any) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { message: `Error fetching post: ${error.message}` },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[slug] - Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Parse the request body
    const body = await request.json();
    const { lang, mdxContent } = body;
    
    if (!lang || !mdxContent) {
      return NextResponse.json(
        { message: 'Missing required fields: lang or mdxContent' },
        { status: 400 }
      );
    }
    
    if (lang !== 'en' && lang !== 'pl') {
      return NextResponse.json(
        { message: 'Invalid language. Must be "en" or "pl".' },
        { status: 400 }
      );
    }
    
    const filePath = getFilePath(slug, lang);
    
    // Ensure posts directory exists
    try {
      await fs.access(POSTS_DIRECTORY);
    } catch (error) {
      await fs.mkdir(POSTS_DIRECTORY, { recursive: true });
    }
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return NextResponse.json(
        { message: `Post not found: ${slug} (${lang})` },
        { status: 404 }
      );
    }
    
    // Extract metadata from MDX
    const { data: metadata } = matter(mdxContent);
    
    // Write the updated file
    await fs.writeFile(filePath, mdxContent, 'utf8');

    return NextResponse.json({
      message: 'Post updated successfully',
      slug,
      title: metadata.title,
      date: metadata.date,
      published: metadata.published === true,
    });
    
  } catch (error: any) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { message: `Error updating post: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[slug] - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Get language from query parameters
    const url = new URL(request.url);
    const lang = url.searchParams.get('lang') || 'en';
    
    if (!lang || (lang !== 'en' && lang !== 'pl')) {
      return NextResponse.json(
        { message: 'Invalid language parameter. Must be "en" or "pl".' },
        { status: 400 }
      );
    }
    
    const filePath = getFilePath(slug, lang);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return NextResponse.json(
        { message: `Post not found: ${slug} (${lang})` },
        { status: 404 }
      );
    }

    // Delete the file
    await fs.unlink(filePath);

    return NextResponse.json({
      message: 'Post deleted successfully',
      slug,
      lang,
    });
    
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { message: `Error deleting post: ${error.message}` },
      { status: 500 }
    );
  }
} 
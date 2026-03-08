const express = require('express');
const { query, queryOne, queryAll } = require('../db');

const router = express.Router();

// GET /api/blog/posts - Public
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, featured } = req.query;
    let whereClause = 'WHERE is_published = true';
    const params = [];

    if (category) {
      params.push(category);
      whereClause += ` AND category_id = $${params.length}`;
    }
    if (featured === 'true') {
      whereClause += ' AND is_featured = true';
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);

    const posts = await queryAll(
      `SELECT bp.*, bc.name_en as category_name, bc.slug as category_slug
       FROM blog_posts bp
       LEFT JOIN blog_categories bc ON bp.category_id = bc.id
       ${whereClause}
       ORDER BY bp.published_at DESC NULLS LAST, bp.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const countResult = await queryOne(
      `SELECT COUNT(*) FROM blog_posts ${whereClause.replace(/ LIMIT.*/, '')}`,
      params.slice(0, -2)
    );

    res.json({
      posts,
      total: parseInt(countResult.count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('List posts error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET /api/blog/posts/:slug - Public
router.get('/posts/:slug', async (req, res) => {
  try {
    const post = await queryOne(
      `SELECT bp.*, bc.name_en as category_name, bc.slug as category_slug
       FROM blog_posts bp
       LEFT JOIN blog_categories bc ON bp.category_id = bc.id
       WHERE bp.slug = $1 AND bp.is_published = true`,
      [req.params.slug]
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Increment view count
    await query('SELECT increment_page_views($1, $2)', ['blog_posts', post.id]);

    // Get tags
    const tags = await queryAll(
      `SELECT bt.* FROM blog_tags bt
       JOIN blog_post_tags bpt ON bt.id = bpt.tag_id
       WHERE bpt.post_id = $1`,
      [post.id]
    );
    post.tags = tags;

    // Get related posts
    const related = await queryAll(
      `SELECT bp.id, bp.title_en, bp.title_bn, bp.slug, bp.featured_image, bp.excerpt_en
       FROM blog_related_posts brp
       JOIN blog_posts bp ON brp.related_post_id = bp.id
       WHERE brp.post_id = $1 AND bp.is_published = true
       ORDER BY brp.relevance_score DESC
       LIMIT 3`,
      [post.id]
    );
    post.related = related;

    res.json({ post });
  } catch (err) {
    console.error('Get post error:', err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// GET /api/blog/categories - Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await queryAll(
      'SELECT * FROM blog_categories WHERE is_active = true ORDER BY sort_order, name_en'
    );
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/blog/case-studies - Public
router.get('/case-studies', async (req, res) => {
  try {
    const { featured } = req.query;
    let whereClause = 'WHERE is_published = true';
    if (featured === 'true') whereClause += ' AND is_featured = true';

    const caseStudies = await queryAll(
      `SELECT * FROM case_studies ${whereClause} ORDER BY sort_order, created_at DESC`
    );
    res.json({ caseStudies });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch case studies' });
  }
});

// GET /api/blog/case-studies/:slug - Public
router.get('/case-studies/:slug', async (req, res) => {
  try {
    const caseStudy = await queryOne(
      'SELECT * FROM case_studies WHERE slug = $1 AND is_published = true',
      [req.params.slug]
    );
    if (!caseStudy) return res.status(404).json({ error: 'Case study not found' });

    await query('SELECT increment_page_views($1, $2)', ['case_studies', caseStudy.id]);

    res.json({ caseStudy });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch case study' });
  }
});

module.exports = router;

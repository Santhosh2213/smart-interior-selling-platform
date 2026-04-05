/**
 * sketchToRealController.js
 * NewaEC Sketch-to-Real feature — server-side persistence layer.
 *
 * The AI generation itself runs client-side (Anthropic API proxy).
 * These routes let you save, audit, and retrieve generated visualizations
 * tied to project design suggestions.
 *
 * Add to designerRoutes.js:
 *   const { saveSketchToRealResult, getSketchToRealResults } = require('../controllers/sketchToRealController');
 *   router.post('/sketch-to-real/save', saveSketchToRealResult);
 *   router.get('/sketch-to-real/:projectId', getSketchToRealResults);
 */

const DesignSuggestion = require('../models/DesignSuggestion');
const Project = require('../models/Project');
const Designer = require('../models/Designer');
const { createNotification } = require('./notificationController');

/**
 * @desc    Save a NewaEC AI visualization result to a design suggestion draft
 * @route   POST /api/designer/sketch-to-real/save
 * @access  Private (Designer)
 */
const saveSketchToRealResult = async (req, res) => {
  try {
    const designerUserId = req.user.id;
    const { projectId, aiVisualization, designNotes, suggestedTheme } = req.body;

    if (!projectId || !aiVisualization) {
      return res.status(400).json({
        success: false,
        error: 'projectId and aiVisualization are required',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const designer = await Designer.findOne({ userId: designerUserId });
    if (!designer) {
      return res.status(404).json({ success: false, error: 'Designer profile not found' });
    }

    // Find an existing DRAFT, or create a new one
    let suggestion = await DesignSuggestion.findOne({
      projectId,
      designerId: designer._id,
      status: 'DRAFT',
    });

    if (!suggestion) {
      const latest = await DesignSuggestion.findOne({ projectId }).sort('-version');
      suggestion = new DesignSuggestion({
        projectId,
        designerId: designer._id,
        version: latest ? latest.version + 1 : 1,
        status: 'DRAFT',
      });
    }

    // Append AI notes to existing design notes
    if (designNotes) {
      suggestion.designNotes = suggestion.designNotes
        ? `${suggestion.designNotes}\n\n--- NewaEC AI Visualization ---\n${designNotes}`
        : `--- NewaEC AI Visualization ---\n${designNotes}`;
    }
    if (suggestedTheme) suggestion.suggestedTheme = suggestedTheme;

    // Store the full AI payload in internalNotes for auditing
    suggestion.internalNotes = JSON.stringify({
      newaecGenerated: true,
      generatedAt: new Date().toISOString(),
      aiVisualization,
    });

    await suggestion.save();

    // Confirmation notification for the designer
    try {
      await createNotification({
        userId: designerUserId,
        type: 'DESIGN_UPDATE',
        title: 'NewaEC Visualization Saved',
        message: `AI sketch visualization saved for project: ${project.title}`,
        projectId,
      });
    } catch (notifErr) {
      console.warn('Notification error (non-blocking):', notifErr.message);
    }

    res.json({
      success: true,
      message: 'NewaEC visualization saved to design suggestion draft',
      data: {
        suggestionId: suggestion._id,
        version: suggestion.version,
        status: suggestion.status,
      },
    });
  } catch (err) {
    console.error('saveSketchToRealResult error:', err);
    res.status(500).json({ success: false, error: 'Server error saving visualization' });
  }
};

/**
 * @desc    Get all NewaEC-generated results for a project
 * @route   GET /api/designer/sketch-to-real/:projectId
 * @access  Private (Designer)
 */
const getSketchToRealResults = async (req, res) => {
  try {
    const { projectId } = req.params;

    const suggestions = await DesignSuggestion.find({ projectId })
      .select('version status internalNotes designNotes suggestedTheme createdAt')
      .sort('-version')
      .lean();

    const newaecResults = suggestions
      .filter(s => {
        try {
          const notes = JSON.parse(s.internalNotes || '{}');
          return notes.newaecGenerated === true;
        } catch {
          return false;
        }
      })
      .map(s => {
        const parsed = JSON.parse(s.internalNotes);
        return {
          suggestionId: s._id,
          version: s.version,
          status: s.status,
          generatedAt: parsed.generatedAt,
          aiVisualization: parsed.aiVisualization,
          designNotes: s.designNotes,
          suggestedTheme: s.suggestedTheme,
        };
      });

    res.json({ success: true, count: newaecResults.length, data: newaecResults });
  } catch (err) {
    console.error('getSketchToRealResults error:', err);
    res.status(500).json({ success: false, error: 'Server error fetching results' });
  }
};

module.exports = { saveSketchToRealResult, getSketchToRealResults };
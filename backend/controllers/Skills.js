const { Skills } = require('../config/database');

exports.getSkills = async (req, res) => {
    try {
        const skills = await Skills.findAll({
            where: {
                userId: req.user.id,
            },
            attributes: ['id', 'Languages', 'Visualization', 'Cloud', 'Frameworks', 'Database', 'Tools', 'Webdevelopment'],
        });
        res.status(200).json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching skills' });
    }
}

exports.createSkills = async (req, res) => {
    try {
        const { Languages, Visualization, Cloud, Frameworks, Database, Tools, Webdevelopment } = req.body;
        const newSkills = await Skills.create({
            Languages,
            Visualization,
            Cloud,
            Frameworks,
            Database,
            Tools,
            Webdevelopment,
            userId: req.user.id,
        });
        res.status(201).json(newSkills);
    } catch (error) {
        res.status(500).json({ message: 'Error creating skills' });
    }
}

exports.updateSkills = async (req, res) => {
    try {
        const { id } = req.params;
        const { Languages, Visualization, Cloud, Frameworks, Database, Tools, Webdevelopment } = req.body;
        const skills = await Skills.findByPk(id);
        if (!skills) {
            return res.status(404).json({ message: 'Skills not found' });
        }
        skills.Languages = Languages;
        skills.Visualization = Visualization;
        skills.Cloud = Cloud;
        skills.Frameworks = Frameworks;
        skills.Database = Database;
        skills.Tools = Tools;
        skills.Webdevelopment = Webdevelopment;
        await skills.save();
        res.status(200).json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Error updating skills' });
    }
}

exports.deleteSkills = async (req, res) => {
    try {
        const { id } = req.params;
        const skills = await Skills.findByPk(id);
        if (!skills) {
            return res.status(404).json({ message: 'Skills not found' });
        }
        await skills.destroy();
        res.status(200).json({ message: 'Skills deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting skills' });
    }
}
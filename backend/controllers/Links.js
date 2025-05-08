const { Links } = require('../config/database');

exports.getLinks = async (req, res) => {
    try {
        const links = await Links.findAll({
            where: {
                userId: req.user.id,
            },
            attributes: ['id', 'github', 'leetcode', 'linkedin', 'portfolio'],
        });
        res.status(200).json(links);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching links' });
    }
}

exports.createLinks = async (req, res) => {
    try {
        const { github, leetcode, linkedin, portfolio } = req.body;
        const newLinks = await Links.create({
            github,
            leetcode,
            linkedin,
            portfolio,
            userId: req.user.id,
        });
        res.status(201).json(newLinks);
    } catch (error) {
        res.status(500).json({ message: 'Error creating links' });
    }
}

exports.updateLinks = async (req, res) => {
    try {
        const { id } = req.params;
        const { github, leetcode, linkedin, portfolio } = req.body;
        const links = await Links.findByPk(id);
        if (!links) {
            return res.status(404).json({ message: 'Links not found' });
        }
        links.github = github;
        links.leetcode = leetcode;
        links.linkedin = linkedin;
        links.portfolio = portfolio;
        await links.save();
        res.status(200).json(links);
    } catch (error) {
        res.status(500).json({ message: 'Error updating links' });
    }
}

exports.deleteLinks = async (req, res) => {
    try {
        const { id } = req.params;
        const links = await Links.findByPk(id);
        if (!links) {
            return res.status(404).json({ message: 'Links not found' });
        }
        await links.destroy();
        res.status(200).json({ message: 'Links deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting links' });
    }
}
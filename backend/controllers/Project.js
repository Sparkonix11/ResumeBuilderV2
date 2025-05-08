const { Project } = require('../config/database');

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({
            where: {
                userId: req.user.id,
            },
            attributes: ['id', 'title', 'description', 'technologies', 'githubrepository', 'livelink'],
        });
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects' });
    }
}

exports.createProject = async (req, res) => {
    try {
        const { title, description, technologies, githubrepository, livelink } = req.body;
        const newProject = await Project.create({
            title,
            description,
            technologies,
            githubrepository,
            livelink,
            userId: req.user.id,
        });
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: 'Error creating project' });
    }
}

exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, technologies, githubrepository, livelink } = req.body;
        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        project.title = title;
        project.description = description;
        project.technologies = technologies;
        project.githubrepository = githubrepository;
        project.livelink = livelink;
        await project.save();
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error updating project' });
    }
}

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        await project.destroy();
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting project' });
    }
}

exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project' });
    }
}
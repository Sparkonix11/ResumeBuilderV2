const { Experience } = require("../config/database");

exports.getExperience = async (req, res) => {
    try {
        const experience = await Experience.findAll(
            {
                where: {
                    userId: req.user.id,
                },
                attributes: ["id", "companyName", "companyLocation", "position", "startDate", "isCurrent", "endDate", "description"],
            }
        );
        res.status(200).json(experience);
    } catch (error) {
        res.status(500).json({ message: "Error fetching experience" });
    }
}

exports.createExperience = async (req, res) => {
    try {
        const { companyName, companyLocation, position, startDate, isCurrent, endDate, description } = req.body;
        const newExperience = await Experience.create({
            companyName,
            companyLocation,
            position,
            startDate,
            isCurrent,
            endDate,
            description,
            userId: req.user.id,
        });
        res.status(201).json(newExperience);
    } catch (error) {
        res.status(500).json({ message: "Error creating experience" });
    }
}

exports.updateExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const { companyName, companyLocation, position, startDate, isCurrent, endDate, description } = req.body;
        const experience = await Experience.findByPk(id);
        if (!experience) {
            return res.status(404).json({ message: "Experience not found" });
        }
        experience.companyName = companyName;
        experience.companyLocation = companyLocation;
        experience.position = position;
        experience.startDate = startDate;
        experience.isCurrent = isCurrent;
        experience.endDate = endDate;
        experience.description = description;
        await experience.save();
        res.status(200).json(experience);
    } catch (error) {
        res.status(500).json({ message: "Error updating experience" });
    }
}

exports.deleteExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const experience = await Experience.findByPk(id);
        if (!experience) {
            return res.status(404).json({ message: "Experience not found" });
        }
        await experience.destroy();
        res.status(200).json({ message: "Experience deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting experience" });
    }
}

exports.getExperienceById = async (req, res) => {
    try {
        const { id } = req.params;
        const experience = await Experience.findByPk(id);
        if (!experience) {
            return res.status(404).json({ message: "Experience not found" });
        }
        res.status(200).json(experience);
    } catch (error) {
        res.status(500).json({ message: "Error fetching experience" });
    }
}
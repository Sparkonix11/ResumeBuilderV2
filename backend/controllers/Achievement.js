const { Achievement } = require("../config/database");

exports.getAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.findAll(
            {
                where: {
                    userId: req.user.id,
                },
                attributes: ["id", "text"],
            }
        );
        res.status(200).json(achievements);
    } catch (error) {
        res.status(500).json({ message: "Error fetching achievements" });
    }
}

exports.createAchievement = async (req, res) => {
    try {
        const { text } = req.body;
        const newAchievement = await Achievement.create({
            text,
            userId: req.user.id,
        });
        res.status(201).json(newAchievement);
    } catch (error) {
        res.status(500).json({ message: "Error creating achievement" });
    }
}
exports.updateAchievement = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const achievement = await Achievement.findByPk(id);
        if (!achievement) {
            return res.status(404).json({ message: "Achievement not found" });
        }
        achievement.text = text;
        await achievement.save();
        res.status(200).json(achievement);
    } catch (error) {
        res.status(500).json({ message: "Error updating achievement" });
    }
}
exports.deleteAchievement = async (req, res) => {
    try {
        const { id } = req.params;
        const achievement = await Achievement.findByPk(id);
        if (!achievement) {
            return res.status(404).json({ message: "Achievement not found" });
        }
        await achievement.destroy();
        res.status(200).json({ message: "Achievement deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting achievement" });
    }
}


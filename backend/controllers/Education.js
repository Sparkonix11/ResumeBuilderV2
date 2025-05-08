const { Education } = require("../config/database");

exports.getEducation = async (req, res) => {
    try {
        const education = await Education.findAll(
            {
                where: {
                    userId: req.user.id,
                },
                attributes: ["id", "institution", "institutionLocation", "degree", "fieldOfStudy", "startDate", "isCurrent", "endDate"],}
        );
        res.status(200).json(education);
    } catch (error) {
        res.status(500).json({ message: "Error fetching education" });
    }
}

exports.createEducation = async (req, res) => {
    try {
        const { institution, institutionLocation, degree, fieldOfStudy, startDate, isCurrent, endDate } = req.body;
        const newEducation = await Education.create({
            institution,
            institutionLocation,
            degree,
            fieldOfStudy,
            startDate,
            isCurrent,
            endDate,
            userId: req.user.id,
        });
        res.status(201).json(newEducation);
    } catch (error) {
        res.status(500).json({ message: "Error creating education" });
    }
}

exports.updateEducation = async (req, res) => {
    try {
        const { id } = req.params;
        const { institution, institutionLocation, degree, fieldOfStudy, startDate, isCurrent, endDate } = req.body;
        const education = await Education.findByPk(id);
        if (!education) {
            return res.status(404).json({ message: "Education not found" });
        }
        education.institution = institution;
        education.institutionLocation = institutionLocation;
        education.degree = degree;
        education.fieldOfStudy = fieldOfStudy;
        education.startDate = startDate;
        education.isCurrent = isCurrent;
        education.endDate = endDate;
        await education.save();
        res.status(200).json(education);
    } catch (error) {
        res.status(500).json({ message: "Error updating education" });
    }
}

exports.deleteEducation = async (req, res) => {
    try {
        const { id } = req.params;
        const education = await Education.findByPk(id);
        if (!education) {
            return res.status(404).json({ message: "Education not found" });
        }
        await education.destroy();
        res.status(200).json({ message: "Education deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting education" });
    }
}

exports.getEducationById = async (req, res) => {
    try {
        const { id } = req.params;
        const education = await Education.findByPk(id);
        if (!education) {
            return res.status(404).json({ message: "Education not found" });
        }
        res.status(200).json(education);
    } catch (error) {
        res.status(500).json({ message: "Error fetching education" });
    }
}
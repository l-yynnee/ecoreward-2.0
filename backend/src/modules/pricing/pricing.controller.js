const Joi = require("joi");
const { UnitPrice } = require("../../../models");

const schema = Joi.object({
  material_type: Joi.string().required(),
  unit_name: Joi.string().required(),
  unit_price: Joi.number().positive().required()
});

exports.createUnitPrice = async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const record = await UnitPrice.create({
    material_type: value.material_type,
    unit_name: value.unit_name,
    unit_price: value.unit_price,
    is_active: true,
    created_by: req.user.id
  });

  res.status(201).json(record);
};

exports.listUnitPrices = async (req, res) => {
  const rows = await UnitPrice.findAll({ where: { is_active: true } });
  res.json(rows);
};

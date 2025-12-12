const adminModel = require('../models/adminModel');

// Organization
async function listOrganizations(req, res, next) {
  try {
    const data = await adminModel.getOrganizations();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function createOrganization(req, res, next) {
  try {
    await adminModel.createOrganization(req.body);
    res.status(201).json({ message: 'Organization created' });
  } catch (error) {
    next(error);
  }
}

async function updateOrganization(req, res, next) {
  try {
    const affected = await adminModel.updateOrganization(req.params.name, req.body);
    if (!affected) return res.status(404).json({ message: 'Organization not found' });
    res.json({ message: 'Organization updated' });
  } catch (error) {
    next(error);
  }
}

async function deleteOrganization(req, res, next) {
  try {
    const affected = await adminModel.deleteOrganization(req.params.name);
    if (!affected) return res.status(404).json({ message: 'Organization not found' });
    res.json({ message: 'Organization deleted' });
  } catch (error) {
    next(error);
  }
}

// Employee
async function listEmployees(req, res, next) {
  try {
    const data = await adminModel.getEmployees();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function createEmployee(req, res, next) {
  try {
    const id = await adminModel.createEmployee(req.body);
    res.status(201).json({ employeeId: id });
  } catch (error) {
    next(error);
  }
}

async function updateEmployee(req, res, next) {
  try {
    const affected = await adminModel.updateEmployee(req.params.id, req.body);
    if (!affected) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee updated' });
  } catch (error) {
    next(error);
  }
}

async function deleteEmployee(req, res, next) {
  try {
    const affected = await adminModel.deleteEmployee(req.params.id);
    if (!affected) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    next(error);
  }
}

// Part-time worker
async function listPartTimeWorkers(req, res, next) {
  try {
    const data = await adminModel.getPartTimeWorkers();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function createPartTimeWorker(req, res, next) {
  try {
    const id = await adminModel.createPartTimeWorker(req.body);
    res.status(201).json({ partTimeWorkerId: id });
  } catch (error) {
    next(error);
  }
}

async function updatePartTimeWorker(req, res, next) {
  try {
    const affected = await adminModel.updatePartTimeWorker(req.params.id, req.body);
    if (!affected) return res.status(404).json({ message: 'Part-time worker not found' });
    res.json({ message: 'Part-time worker updated' });
  } catch (error) {
    next(error);
  }
}

async function deletePartTimeWorker(req, res, next) {
  try {
    const affected = await adminModel.deletePartTimeWorker(req.params.id);
    if (!affected) return res.status(404).json({ message: 'Part-time worker not found' });
    res.json({ message: 'Part-time worker deleted' });
  } catch (error) {
    next(error);
  }
}

// UltraSound
async function listUltraSounds(req, res, next) {
  try {
    const data = await adminModel.getUltraSounds();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function createUltraSound(req, res, next) {
  try {
    await adminModel.createUltraSound(req.body);
    res.status(201).json({ message: 'UltraSound saved' });
  } catch (error) {
    next(error);
  }
}

async function updateUltraSound(req, res, next) {
  try {
    const affected = await adminModel.updateUltraSound(req.params.name, req.body);
    if (!affected) return res.status(404).json({ message: 'UltraSound not found' });
    res.json({ message: 'UltraSound updated' });
  } catch (error) {
    next(error);
  }
}

async function deleteUltraSound(req, res, next) {
  try {
    const affected = await adminModel.deleteUltraSound(req.params.name);
    if (!affected) return res.status(404).json({ message: 'UltraSound not found' });
    res.json({ message: 'UltraSound deleted' });
  } catch (error) {
    next(error);
  }
}

// Probe
async function listProbes(req, res, next) {
  try {
    const data = await adminModel.getProbes();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function listUltrasoundProbeCompatibility(req, res, next) {
  try {
    const data = await adminModel.getUltrasoundProbeCompatibility();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function updateUltrasoundCompatibility(req, res, next) {
  try {
    const { name } = req.params;
    const probeNames = Array.isArray(req.body.probeNames) ? req.body.probeNames : [];
    await adminModel.setUltrasoundCompatibility(name, probeNames);
    res.json({ message: 'Compatibility updated' });
  } catch (error) {
    next(error);
  }
}

async function createProbe(req, res, next) {
  try {
    await adminModel.createProbe(req.body);
    res.status(201).json({ message: 'Probe saved' });
  } catch (error) {
    next(error);
  }
}

async function updateProbe(req, res, next) {
  try {
    const affected = await adminModel.updateProbe(req.params.name, req.body);
    if (!affected) return res.status(404).json({ message: 'Probe not found' });
    res.json({ message: 'Probe updated' });
  } catch (error) {
    next(error);
  }
}

async function deleteProbe(req, res, next) {
  try {
    const affected = await adminModel.deleteProbe(req.params.name);
    if (!affected) return res.status(404).json({ message: 'Probe not found' });
    res.json({ message: 'Probe deleted' });
  } catch (error) {
    next(error);
  }
}

// Event item
async function listEventItems(req, res, next) {
  try {
    const data = await adminModel.getEventItems();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function createEventItem(req, res, next) {
  try {
    const id = await adminModel.createEventItem(req.body);
    res.status(201).json({ eventItemId: id });
  } catch (error) {
    next(error);
  }
}

async function updateEventItem(req, res, next) {
  try {
    const affected = await adminModel.updateEventItem(req.params.id, req.body);
    if (!affected) return res.status(404).json({ message: 'Event item not found' });
    res.json({ message: 'Event item updated' });
  } catch (error) {
    next(error);
  }
}

async function deleteEventItem(req, res, next) {
  try {
    const affected = await adminModel.deleteEventItem(req.params.id);
    if (!affected) return res.status(404).json({ message: 'Event item not found' });
    res.json({ message: 'Event item deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  listPartTimeWorkers,
  createPartTimeWorker,
  updatePartTimeWorker,
  deletePartTimeWorker,
  listUltraSounds,
  createUltraSound,
  updateUltraSound,
  deleteUltraSound,
  listProbes,
  listUltrasoundProbeCompatibility,
  updateUltrasoundCompatibility,
  createProbe,
  updateProbe,
  deleteProbe,
  listEventItems,
  createEventItem,
  updateEventItem,
  deleteEventItem
};

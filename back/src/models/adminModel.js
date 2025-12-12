const pool = require('../db');

// Organization
async function getOrganizations() {
  const [rows] = await pool.query('SELECT * FROM organization ORDER BY Name ASC');
  return rows;
}

async function createOrganization(data) {
  const query = `
    INSERT INTO organization (Name, Location, Contact, Representative, Type)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [data.name, data.location || null, data.contact || null, data.representative || null, data.type || null];
  const [result] = await pool.query(query, params);
  return result.insertId;
}

async function updateOrganization(name, data) {
  const query = `
    UPDATE organization
    SET Location = ?, Contact = ?, Representative = ?, Type = ?
    WHERE Name = ?
  `;
  const params = [data.location || null, data.contact || null, data.representative || null, data.type || null, name];
  const [result] = await pool.query(query, params);
  return result.affectedRows;
}

async function deleteOrganization(name) {
  const [result] = await pool.query('DELETE FROM organization WHERE Name = ?', [name]);
  return result.affectedRows;
}

// Employee
async function getEmployees() {
  const [rows] = await pool.query('SELECT * FROM employee ORDER BY EmployeeID DESC');
  return rows;
}

async function createEmployee(data) {
  const query = `
    INSERT INTO employee (Name, Position, Team, OrganizationName, Contact)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [data.name, data.position || null, data.team || null, data.organizationName || null, data.contact || null];
  const [result] = await pool.query(query, params);
  return result.insertId;
}

async function updateEmployee(id, data) {
  const query = `
    UPDATE employee
    SET Name = ?, Position = ?, Team = ?, OrganizationName = ?, Contact = ?
    WHERE EmployeeID = ?
  `;
  const params = [data.name, data.position || null, data.team || null, data.organizationName || null, data.contact || null, id];
  const [result] = await pool.query(query, params);
  return result.affectedRows;
}

async function deleteEmployee(id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM eventemployee WHERE EmployeeID = ?', [id]);
    const [result] = await connection.query('DELETE FROM employee WHERE EmployeeID = ?', [id]);
    await connection.commit();
    return result.affectedRows;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Part-time worker
async function getPartTimeWorkers() {
  const [rows] = await pool.query('SELECT * FROM parttimeworker ORDER BY PartTimeWorkerID DESC');
  return rows;
}

async function createPartTimeWorker(data) {
  const query = `
    INSERT INTO parttimeworker (Name, Age, Gender, AccountNumber)
    VALUES (?, ?, ?, ?)
  `;
  const params = [data.name, data.age || null, data.gender || null, data.accountNumber || null];
  const [result] = await pool.query(query, params);
  return result.insertId;
}

async function updatePartTimeWorker(id, data) {
  const query = `
    UPDATE parttimeworker
    SET Name = ?, Age = ?, Gender = ?, AccountNumber = ?
    WHERE PartTimeWorkerID = ?
  `;
  const params = [data.name, data.age || null, data.gender || null, data.accountNumber || null, id];
  const [result] = await pool.query(query, params);
  return result.affectedRows;
}

async function deletePartTimeWorker(id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM eventparttimeworker WHERE PartTimeWorkerID = ?', [id]);
    const [result] = await connection.query('DELETE FROM parttimeworker WHERE PartTimeWorkerID = ?', [id]);
    await connection.commit();
    return result.affectedRows;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Ultrasound
async function getUltraSounds() {
  const [rows] = await pool.query('SELECT * FROM ultrasound ORDER BY Name ASC');
  return rows;
}

async function createUltraSound(data) {
  const query = `
    INSERT INTO ultrasound (Name)
    VALUES (?)
    ON DUPLICATE KEY UPDATE Name = VALUES(Name)
  `;
  const params = [data.name];
  const [result] = await pool.query(query, params);
  return result.insertId || result.affectedRows;
}

async function updateUltraSound(name, data) {
  const newName = data.name || name;
  const [result] = await pool.query(`UPDATE ultrasound SET Name = ? WHERE Name = ?`, [newName, name]);
  return result.affectedRows;
}

async function deleteUltraSound(name) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM eventultrasound WHERE UltraSoundName = ?', [name]);
    await connection.query('DELETE FROM ultrasoundprobecompatibility WHERE UltraSoundName = ?', [name]);
    const [result] = await connection.query('DELETE FROM ultrasound WHERE Name = ?', [name]);
    await connection.commit();
    return result.affectedRows;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Probe
async function getProbes() {
  const [rows] = await pool.query('SELECT * FROM probe ORDER BY Name ASC');
  return rows;
}

async function createProbe(data) {
  const query = `
    INSERT INTO probe (Name, Type, Application)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE Type = VALUES(Type), Application = VALUES(Application)
  `;
  const params = [data.name, data.type || null, data.application || null];
  const [result] = await pool.query(query, params);
  return result.insertId;
}

async function updateProbe(name, data) {
  const query = `
    UPDATE probe
    SET Type = ?, Application = ?
    WHERE Name = ?
  `;
  const params = [data.type || null, data.application || null, name];
  const [result] = await pool.query(query, params);
  return result.affectedRows;
}

async function deleteProbe(name) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM eventprobe WHERE ProbeName = ?', [name]);
    await connection.query('DELETE FROM ultrasoundprobecompatibility WHERE ProbeName = ?', [name]);
    const [result] = await connection.query('DELETE FROM probe WHERE Name = ?', [name]);
    await connection.commit();
    return result.affectedRows;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Ultrasound-Probe compatibility
async function getUltrasoundProbeCompatibility() {
  const [rows] = await pool.query(
    'SELECT UltraSoundName, ProbeName FROM ultrasoundprobecompatibility ORDER BY UltraSoundName ASC, ProbeName ASC'
  );
  return rows;
}

async function setUltrasoundCompatibility(ultraSoundName, probeNames = []) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM ultrasoundprobecompatibility WHERE UltraSoundName = ?', [ultraSoundName]);
    for (const name of probeNames) {
      await connection.query(
        'INSERT INTO ultrasoundprobecompatibility (UltraSoundName, ProbeName) VALUES (?, ?)',
        [ultraSoundName, name]
      );
    }
    await connection.commit();
    return probeNames.length;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// EventItem
async function getEventItems() {
  const [rows] = await pool.query(
    `
      SELECT *
      FROM eventitem
      WHERE NOT (ItemType = 'Custom' AND ItemName = 'Custom Item Placeholder')
      ORDER BY EventItemID DESC
    `
  );
  return rows;
}

async function createEventItem(data) {
  const query = `
    INSERT INTO eventitem (ItemType, ItemName, MaxQuantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE ItemType = VALUES(ItemType), ItemName = VALUES(ItemName), MaxQuantity = VALUES(MaxQuantity)
  `;
  const params = [data.itemType, data.itemName, data.maxQuantity ?? null];
  const [result] = await pool.query(query, params);
  return result.insertId;
}

async function updateEventItem(id, data) {
  const query = `
    UPDATE eventitem
    SET ItemType = ?, ItemName = ?, MaxQuantity = ?
    WHERE EventItemID = ?
  `;
  const params = [data.itemType, data.itemName, data.maxQuantity ?? null, id];
  const [result] = await pool.query(query, params);
  return result.affectedRows;
}

async function deleteEventItem(id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM eventitemusage WHERE EventItemID = ?', [id]);
    const [result] = await connection.query('DELETE FROM eventitem WHERE EventItemID = ?', [id]);
    await connection.commit();
    return result.affectedRows;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getPartTimeWorkers,
  createPartTimeWorker,
  updatePartTimeWorker,
  deletePartTimeWorker,
  getUltraSounds,
  createUltraSound,
  updateUltraSound,
  deleteUltraSound,
  getProbes,
  createProbe,
  updateProbe,
  deleteProbe,
  getUltrasoundProbeCompatibility,
  setUltrasoundCompatibility,
  getEventItems,
  createEventItem,
  updateEventItem,
  deleteEventItem
};

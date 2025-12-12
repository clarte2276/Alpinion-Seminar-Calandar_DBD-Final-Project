const pool = require('../db');

const formatDateToRange = (month) => {
  const start = new Date(`${month}-01T00:00:00Z`);
  if (Number.isNaN(start.getTime())) {
    throw new Error('Invalid month format');
  }
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  const toDbDate = (d) => d.toISOString().slice(0, 10);
  return { startDate: toDbDate(start), endDate: toDbDate(end) };
};

async function ensureCustomEventItemId(connection) {
  // 재사용할 커스텀용 EventItem 레코드 확보
  const placeholderName = 'Custom Item Placeholder';
  const placeholderType = 'Custom';

  const [[existing]] = await connection.query(
    `SELECT EventItemID FROM eventitem WHERE ItemName = ? AND ItemType = ? LIMIT 1`,
    [placeholderName, placeholderType]
  );

  if (existing?.EventItemID) return existing.EventItemID;

  const [result] = await connection.query(
    `INSERT INTO eventitem (ItemType, ItemName, MaxQuantity) VALUES (?, ?, NULL)`,
    [placeholderType, placeholderName]
  );
  return result.insertId;
}

async function getEventsByMonth(month) {
  const { startDate, endDate } = formatDateToRange(month);
  const query = `
    SELECT EventID, Name, EventDate, EventTime, Location, Type, ParticipantCount, OrganizationName
    FROM event
    WHERE EventDate >= ? AND EventDate < ?
    ORDER BY EventDate ASC, EventTime ASC
  `;
  const [rows] = await pool.query(query, [startDate, endDate]);
  return rows;
}

async function getEventDetail(eventId) {
  const [[event]] = await pool.query(
    `
      SELECT e.EventID, e.Name, e.EventDate, e.EventTime, e.Location, e.Type, e.ParticipantCount,
             e.OrganizationName, e.Remark,
             o.Location AS OrganizationLocation, o.Contact AS OrganizationContact, o.Representative, o.Type AS OrganizationType
      FROM event e
      LEFT JOIN organization o ON e.OrganizationName = o.Name
      WHERE e.EventID = ?
    `,
    [eventId]
  );

  if (!event) return null;

  const [ultraSounds] = await pool.query(
    `
      SELECT eus.UltraSoundName AS name, eus.Quantity AS quantity
      FROM eventultrasound eus
      WHERE eus.EventID = ?
    `,
    [eventId]
  );

  const [probes] = await pool.query(
    `
      SELECT ep.ProbeName AS name, ep.Quantity AS quantity
      FROM eventprobe ep
      WHERE ep.EventID = ?
    `,
    [eventId]
  );

  const [items] = await pool.query(
    `
      SELECT
        eiu.EventItemID AS eventItemId,
        eiu.Quantity AS quantity,
        ei.ItemType AS itemType,
        ei.ItemName AS itemName,
        ei.MaxQuantity AS maxQuantity
      FROM eventitemusage eiu
      LEFT JOIN eventitem ei ON eiu.EventItemID = ei.EventItemID
      WHERE eiu.EventID = ?
    `,
    [eventId]
  );

  const [tempItems] = await pool.query(
    `
      SELECT
        etu.TempItemName AS customItemName,
        etu.Quantity AS quantity
      FROM eventtempitemusage etu
      WHERE etu.EventID = ?
    `,
    [eventId]
  );

  const [employees] = await pool.query(
    `
      SELECT ee.EmployeeID AS employeeId, ee.Role AS role,
             e.Name AS name, e.Position AS position, e.Team AS team, e.OrganizationName AS organizationName, e.Contact AS contact
      FROM eventemployee ee
      JOIN employee e ON ee.EmployeeID = e.EmployeeID
      WHERE ee.EventID = ?
    `,
    [eventId]
  );

  const [partTimeWorkers] = await pool.query(
    `
      SELECT ept.PartTimeWorkerID AS partTimeWorkerId, ept.WorkHours AS workHours,
             p.Name AS name, p.Age AS age, p.Gender AS gender, p.AccountNumber AS accountNumber
      FROM eventparttimeworker ept
      JOIN parttimeworker p ON ept.PartTimeWorkerID = p.PartTimeWorkerID
      WHERE ept.EventID = ?
    `,
    [eventId]
  );

  const [shipments] = await pool.query(
    `
      SELECT ShipmentID, DriverName, ExpectShipmentTime, ExpectArriveTime, RealShipmentTime, RealArriveTime
      FROM shipment
      WHERE EventID = ?
      ORDER BY ShipmentID DESC
    `,
    [eventId]
  );

  return {
    event,
    ultraSounds,
    probes,
    items: [...items, ...tempItems.map((row) => ({ ...row, eventItemId: null, itemType: 'Custom' }))],
    employees,
    partTimeWorkers,
    shipment: shipments[0] || null
  };
}

async function createEvent(payload) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const evt = payload.event || {};
    const [eventResult] = await connection.query(
      `
        INSERT INTO event (Name, EventDate, EventTime, Location, Type, ParticipantCount, OrganizationName, Remark)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        evt.name,
        evt.eventDate,
        evt.eventTime,
        evt.location || null,
        evt.type || null,
        evt.participantCount || 0,
        evt.organizationName || null,
        evt.remark || null
      ]
    );

    const eventId = eventResult.insertId;

    if (Array.isArray(payload.ultraSounds)) {
      for (const item of payload.ultraSounds) {
        await connection.query(
          `INSERT INTO eventultrasound (EventID, UltraSoundName, Quantity) VALUES (?, ?, ?)`,
          [eventId, item.name, item.quantity || 0]
        );
      }
    }

    if (Array.isArray(payload.probes)) {
      for (const item of payload.probes) {
        await connection.query(
          `INSERT INTO eventprobe (EventID, ProbeName, Quantity) VALUES (?, ?, ?)`,
          [eventId, item.name, item.quantity || 0]
        );
      }
    }

    if (Array.isArray(payload.items)) {
      for (const item of payload.items) {
        if (!item.eventItemId) {
          throw new Error('Item must have eventItemId');
        }
        await connection.query(
          `INSERT INTO eventitemusage (EventID, EventItemID, Quantity) VALUES (?, ?, ?)`,
          [eventId, item.eventItemId, item.quantity || 0]
        );
      }
    }

    if (Array.isArray(payload.tempItems)) {
      for (const item of payload.tempItems) {
        await connection.query(
          `INSERT INTO eventtempitemusage (EventID, TempItemName, Quantity) VALUES (?, ?, ?)`,
          [eventId, item.tempItemName, item.quantity || 0]
        );
      }
    }

    if (Array.isArray(payload.employees)) {
      for (const emp of payload.employees) {
        await connection.query(
          `INSERT INTO eventemployee (EventID, EmployeeID, Role) VALUES (?, ?, ?)`,
          [eventId, emp.employeeId, emp.role || null]
        );
      }
    }

    if (Array.isArray(payload.partTimeWorkers)) {
      for (const pt of payload.partTimeWorkers) {
        await connection.query(
          `INSERT INTO eventparttimeworker (EventID, PartTimeWorkerID, WorkHours) VALUES (?, ?, ?)`,
          [eventId, pt.partTimeWorkerId, pt.workHours || 0]
        );
      }
    }

    if (payload.shipment) {
      const s = payload.shipment;
      await connection.query(
        `
          INSERT INTO shipment (DriverName, ExpectShipmentTime, ExpectArriveTime, RealShipmentTime, RealArriveTime, EventID)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          s.driverName || null,
          s.expectShipmentTime || null,
          s.expectArriveTime || null,
          s.realShipmentTime || null,
          s.realArriveTime || null,
          eventId
        ]
      );
    }

    await connection.commit();
    return eventId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateEvent(eventId, payload) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const evt = payload.event || {};
    const [updateResult] = await connection.query(
      `
        UPDATE event
        SET Name = ?, EventDate = ?, EventTime = ?, Location = ?, Type = ?, ParticipantCount = ?, OrganizationName = ?, Remark = ?
        WHERE EventID = ?
      `,
      [
        evt.name,
        evt.eventDate,
        evt.eventTime,
        evt.location || null,
        evt.type || null,
        evt.participantCount || 0,
        evt.organizationName || null,
        evt.remark || null,
        eventId
      ]
    );

    if (updateResult.affectedRows === 0) {
      throw new Error('Event not found');
    }

    await connection.query('DELETE FROM eventultrasound WHERE EventID = ?', [eventId]);
    await connection.query('DELETE FROM eventprobe WHERE EventID = ?', [eventId]);
    await connection.query('DELETE FROM eventitemusage WHERE EventID = ?', [eventId]);
    await connection.query('DELETE FROM eventtempitemusage WHERE EventID = ?', [eventId]);
    await connection.query('DELETE FROM eventemployee WHERE EventID = ?', [eventId]);
    await connection.query('DELETE FROM eventparttimeworker WHERE EventID = ?', [eventId]);
    await connection.query('DELETE FROM shipment WHERE EventID = ?', [eventId]);

    if (Array.isArray(payload.ultraSounds)) {
      for (const item of payload.ultraSounds) {
        await connection.query(
          `INSERT INTO eventultrasound (EventID, UltraSoundName, Quantity) VALUES (?, ?, ?)`,
          [eventId, item.name, item.quantity || 0]
        );
      }
    }

    if (Array.isArray(payload.probes)) {
      for (const item of payload.probes) {
        await connection.query(
          `INSERT INTO eventprobe (EventID, ProbeName, Quantity) VALUES (?, ?, ?)`,
          [eventId, item.name, item.quantity || 0]
        );
      }
    }

    if (Array.isArray(payload.items)) {
      for (const item of payload.items) {
        if (!item.eventItemId) {
          throw new Error('Item must have eventItemId');
        }
        await connection.query(
          `INSERT INTO eventitemusage (EventID, EventItemID, Quantity) VALUES (?, ?, ?)`,
          [eventId, item.eventItemId, item.quantity || 0]
        );
      }
    }

    if (Array.isArray(payload.tempItems)) {
      for (const item of payload.tempItems) {
        await connection.query(
          `INSERT INTO eventtempitemusage (EventID, TempItemName, Quantity) VALUES (?, ?, ?)`,
          [eventId, item.tempItemName, item.quantity || 0]
        );
      }
    }

    if (Array.isArray(payload.employees)) {
      for (const emp of payload.employees) {
        await connection.query(
          `INSERT INTO eventemployee (EventID, EmployeeID, Role) VALUES (?, ?, ?)`,
          [eventId, emp.employeeId, emp.role || null]
        );
      }
    }

    if (Array.isArray(payload.partTimeWorkers)) {
      for (const pt of payload.partTimeWorkers) {
        await connection.query(
          `INSERT INTO eventparttimeworker (EventID, PartTimeWorkerID, WorkHours) VALUES (?, ?, ?)`,
          [eventId, pt.partTimeWorkerId, pt.workHours || 0]
        );
      }
    }

    if (payload.shipment) {
      const s = payload.shipment;
      await connection.query(
        `
          INSERT INTO shipment (DriverName, ExpectShipmentTime, ExpectArriveTime, RealShipmentTime, RealArriveTime, EventID)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          s.driverName || null,
          s.expectShipmentTime || null,
          s.expectArriveTime || null,
          s.realShipmentTime || null,
          s.realArriveTime || null,
          eventId
        ]
      );
    }

    await connection.commit();
    return eventId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteEvent(eventId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query('DELETE FROM eventultrasound WHERE EventID = ?', [eventId]);
    await connection.query('DELETE FROM eventprobe WHERE EventID = ?', [eventId]);
    await connection.query('DELETE FROM eventitemusage WHERE EventID = ?', [eventId]);
    await connection.query('DELETE FROM eventemployee WHERE EventID = ?', [eventId]);
    await connection.query('DELETE FROM eventparttimeworker WHERE EventID = ?', [eventId]);
    await connection.query('DELETE FROM shipment WHERE EventID = ?', [eventId]);

    const [result] = await connection.query('DELETE FROM event WHERE EventID = ?', [eventId]);
    await connection.commit();
    return result.affectedRows;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function cloneEvent(eventId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [[event]] = await connection.query(
      `
        SELECT Name, EventDate, EventTime, Location, Type, ParticipantCount, OrganizationName, Remark
        FROM event
        WHERE EventID = ?
      `,
      [eventId]
    );

    if (!event) {
      throw new Error('Event not found');
    }

    const [insertResult] = await connection.query(
      `
        INSERT INTO event (Name, EventDate, EventTime, Location, Type, ParticipantCount, OrganizationName, Remark)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        event.Name,
        event.EventDate,
        event.EventTime,
        event.Location || null,
        event.Type || null,
        event.ParticipantCount || 0,
        event.OrganizationName || null,
        event.Remark || null
      ]
    );

    const newEventId = insertResult.insertId;

    const [ultraSounds] = await connection.query(
      `SELECT UltraSoundName AS name, Quantity AS quantity FROM eventultrasound WHERE EventID = ?`,
      [eventId]
    );
    for (const item of ultraSounds) {
      await connection.query(
        `INSERT INTO eventultrasound (EventID, UltraSoundName, Quantity) VALUES (?, ?, ?)`,
        [newEventId, item.name, item.quantity || 0]
      );
    }

    const [probes] = await connection.query(
      `SELECT ProbeName AS name, Quantity AS quantity FROM eventprobe WHERE EventID = ?`,
      [eventId]
    );
    for (const item of probes) {
      await connection.query(
        `INSERT INTO eventprobe (EventID, ProbeName, Quantity) VALUES (?, ?, ?)`,
        [newEventId, item.name, item.quantity || 0]
      );
    }

    const [items] = await connection.query(
      `SELECT EventItemID AS eventItemId, Quantity AS quantity FROM eventitemusage WHERE EventID = ?`,
      [eventId]
    );
    for (const item of items) {
      await connection.query(
        `INSERT INTO eventitemusage (EventID, EventItemID, Quantity) VALUES (?, ?, ?)`,
        [newEventId, item.eventItemId || null, item.quantity || 0]
      );
    }

    const [tempItems] = await connection.query(
      `SELECT TempItemName AS tempItemName, Quantity AS quantity FROM eventtempitemusage WHERE EventID = ?`,
      [eventId]
    );
    for (const item of tempItems) {
      await connection.query(
        `INSERT INTO eventtempitemusage (EventID, TempItemName, Quantity) VALUES (?, ?, ?)`,
        [newEventId, item.tempItemName, item.quantity || 0]
      );
    }

    const [employees] = await connection.query(
      `SELECT EmployeeID AS employeeId, Role AS role FROM eventemployee WHERE EventID = ?`,
      [eventId]
    );
    for (const emp of employees) {
      await connection.query(
        `INSERT INTO eventemployee (EventID, EmployeeID, Role) VALUES (?, ?, ?)`,
        [newEventId, emp.employeeId, emp.role || null]
      );
    }

    const [partTimers] = await connection.query(
      `SELECT PartTimeWorkerID AS partTimeWorkerId, WorkHours AS workHours FROM eventparttimeworker WHERE EventID = ?`,
      [eventId]
    );
    for (const pt of partTimers) {
      await connection.query(
        `INSERT INTO eventparttimeworker (EventID, PartTimeWorkerID, WorkHours) VALUES (?, ?, ?)`,
        [newEventId, pt.partTimeWorkerId, pt.workHours || 0]
      );
    }

    const [shipments] = await connection.query(
      `
        SELECT DriverName, ExpectShipmentTime, ExpectArriveTime, RealShipmentTime, RealArriveTime
        FROM shipment
        WHERE EventID = ?
      `,
      [eventId]
    );
    for (const s of shipments) {
      await connection.query(
        `
          INSERT INTO shipment (DriverName, ExpectShipmentTime, ExpectArriveTime, RealShipmentTime, RealArriveTime, EventID)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          s.DriverName || null,
          s.ExpectShipmentTime || null,
          s.ExpectArriveTime || null,
          s.RealShipmentTime || null,
          s.RealArriveTime || null,
          newEventId
        ]
      );
    }

    await connection.commit();
    return newEventId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getEventsByMonth,
  getEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  cloneEvent
};

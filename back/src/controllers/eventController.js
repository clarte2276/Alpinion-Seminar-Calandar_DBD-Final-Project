const eventModel = require('../models/eventModel');

async function getEventsByMonth(req, res, next) {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: 'month query param (YYYY-MM) is required' });
    }
    const formatDate = (d) => {
      if (!(d instanceof Date)) return d;
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      return local.toISOString().slice(0, 10);
    };
    const formatTime = (t) => {
      if (!(t instanceof Date)) return t;
      const local = new Date(t.getTime() - t.getTimezoneOffset() * 60000);
      return local.toISOString().slice(11, 16);
    };
    const events = await eventModel.getEventsByMonth(month);
    const mapped = events.map((e) => ({
      id: e.EventID,
      eventId: e.EventID,
      name: e.Name,
      eventDate: formatDate(e.EventDate),
      eventTime: formatTime(e.EventTime),
      location: e.Location,
      type: e.Type,
      participantCount: e.ParticipantCount,
      organizationName: e.OrganizationName,
    }));
    res.json(mapped);
  } catch (error) {
    if (error.message === 'Invalid month format') {
      return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM' });
    }
    next(error);
  }
}

async function getEventDetail(req, res, next) {
  try {
    const { eventId } = req.params;
    const data = await eventModel.getEventDetail(eventId);
    if (!data || !data.event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const formatDate = (d) => {
      if (!(d instanceof Date)) return d;
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      return local.toISOString().slice(0, 10);
    };
    const formatTime = (t) => {
      if (!(t instanceof Date)) return t;
      const local = new Date(t.getTime() - t.getTimezoneOffset() * 60000);
      return local.toISOString().slice(11, 16);
    };
    const { event, ultraSounds, probes, items, employees, partTimeWorkers, shipment } = data;
    res.json({
      id: event.EventID,
      eventId: event.EventID,
      name: event.Name,
      eventDate: formatDate(event.EventDate),
      time: formatTime(event.EventTime),
      location: event.Location,
      type: event.Type,
      participantCount: event.ParticipantCount,
      organizationName: event.OrganizationName,
      remark: event.Remark,
      ultraSounds,
      probes,
      items,
      tempItems: undefined,
      employees,
      partTimeWorkers,
      shipment,
    });
  } catch (error) {
    next(error);
  }
}

async function createEvent(req, res, next) {
  try {
    if (!req.body.event || !req.body.event.name || !req.body.event.eventDate || !req.body.event.eventTime) {
      return res.status(400).json({ message: 'event.name, event.eventDate, event.eventTime are required' });
    }
    const eventId = await eventModel.createEvent(req.body);
    res.status(201).json({ eventId });
  } catch (error) {
    next(error);
  }
}

async function updateEvent(req, res, next) {
  try {
    const { eventId } = req.params;
    if (!req.body.event || !req.body.event.name || !req.body.event.eventDate || !req.body.event.eventTime) {
      return res.status(400).json({ message: 'event.name, event.eventDate, event.eventTime are required' });
    }
    const updatedId = await eventModel.updateEvent(eventId, req.body);
    res.json({ eventId: updatedId });
  } catch (error) {
    if (error.message === 'Event not found') {
      return res.status(404).json({ message: 'Event not found' });
    }
    next(error);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const { eventId } = req.params;
    const affected = await eventModel.deleteEvent(eventId);
    if (affected === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
}

async function cloneEvent(req, res, next) {
  try {
    const { eventId } = req.params;
    const newEventId = await eventModel.cloneEvent(eventId);
    res.status(201).json({ eventId: newEventId });
  } catch (error) {
    if (error.message === 'Event not found') {
      return res.status(404).json({ message: 'Event not found' });
    }
    next(error);
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

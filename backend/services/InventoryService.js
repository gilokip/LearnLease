const DeviceModel         = require("../models/Device");
const MaintenanceLogModel = require("../models/MaintenanceLog");
const AuditLogModel       = require("../models/AuditLog");
const { AppError }        = require("../utils/errors");
const { deviceStatus }    = require("../config/constants");

class InventoryService {
  static async addDevice(data, addedBy) {
    // Prevent duplicate serials
    const existing = await DeviceModel.findBySerial(data.serialNumber);
    if (existing) throw new AppError("A device with that serial number already exists.", 409);

    const deviceId = await DeviceModel.create(data);

    await AuditLogModel.log({
      userId:     addedBy,
      action:     "DEVICE_ADDED",
      entityType: "device",
      entityId:   deviceId,
      details:    { brand: data.brand, model: data.model, serial: data.serialNumber },
    });

    return deviceId;
  }

  static async updateDevice(deviceId, fields, updatedBy) {
    const device = await DeviceModel.findById(deviceId);
    if (!device) throw new AppError("Device not found.", 404);

    await DeviceModel.update(deviceId, fields);

    await AuditLogModel.log({
      userId:     updatedBy,
      action:     "DEVICE_UPDATED",
      entityType: "device",
      entityId:   deviceId,
      details:    fields,
    });
  }

  /**
   * Flag a device for maintenance. Sets status to 'maintenance'.
   */
  static async sendToMaintenance(deviceId, { issue, reportedBy }) {
    const device = await DeviceModel.findById(deviceId);
    if (!device) throw new AppError("Device not found.", 404);
    if (device.status === deviceStatus.LEASED)
      throw new AppError("Cannot send a currently leased device to maintenance.", 400);

    await DeviceModel.setStatus(deviceId, deviceStatus.MAINTENANCE);
    const logId = await MaintenanceLogModel.create({ deviceId, reportedBy, issue });

    await AuditLogModel.log({
      userId:     reportedBy,
      action:     "DEVICE_MAINTENANCE_STARTED",
      entityType: "device",
      entityId:   deviceId,
      details:    { issue, logId },
    });

    return logId;
  }

  /**
   * Complete a maintenance job. Sets device status back to 'available'.
   */
  static async completeMaintenance(logId, { resolution, cost, completedBy }) {
    const log = await MaintenanceLogModel.findById(logId);
    if (!log) throw new AppError("Maintenance log not found.", 404);

    await MaintenanceLogModel.resolve(logId, { resolution, cost });
    await DeviceModel.setStatus(log.device_id, deviceStatus.AVAILABLE);

    await AuditLogModel.log({
      userId:     completedBy,
      action:     "DEVICE_MAINTENANCE_RESOLVED",
      entityType: "device",
      entityId:   log.device_id,
      details:    { logId, cost },
    });
  }

  static async getInventorySummary() {
    return DeviceModel.getInventorySummary();
  }
}

module.exports = InventoryService;

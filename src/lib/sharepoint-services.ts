import { sharePointClient } from './sharepoint';
import { SHAREPOINT_LISTS, PERMISSION_LEVELS } from './sharepoint-mappings';

// Generic SharePoint service for CRUD operations
export class SharePointService {
  
  // Generic methods for any list
  async getItems(listName: string, select?: string, filter?: string, orderBy?: string) {
    try {
      let query = `fields`;
      if (select) {
        query = select.split(',').map(field => `fields/${field.trim()}`).join(',');
      }
      
      const items = await sharePointClient.getListItems(listName, query, filter);
      return items.map(item => ({
        id: item.fields.id || item.id,
        ...item.fields
      }));
    } catch (error) {
      console.error(`Error getting items from ${listName}:`, error);
      throw error;
    }
  }

  async createItem(listName: string, data: Record<string, unknown>) {
    try {
      const result = await sharePointClient.createListItem(listName, data);
      return result;
    } catch (error) {
      console.error(`Error creating item in ${listName}:`, error);
      throw error;
    }
  }

  async updateItem(listName: string, itemId: string, data: Record<string, unknown>) {
    try {
      const result = await sharePointClient.updateListItem(listName, itemId, data);
      return result;
    } catch (error) {
      console.error(`Error updating item in ${listName}:`, error);
      throw error;
    }
  }

  async deleteItem(listName: string, itemId: string) {
    try {
      await sharePointClient.deleteListItem(listName, itemId);
    } catch (error) {
      console.error(`Error deleting item from ${listName}:`, error);
      throw error;
    }
  }
}

// Specific services for each module
export class MandantesService extends SharePointService {
  async getMandantes() {
    return this.getItems(SHAREPOINT_LISTS.MANDANTES);
  }

  async createMandante(data: Record<string, unknown>) {
    return this.createItem(SHAREPOINT_LISTS.MANDANTES, data);
  }

  async updateMandante(id: string, data: Record<string, unknown>) {
    return this.updateItem(SHAREPOINT_LISTS.MANDANTES, id, data);
  }

  async deleteMandante(id: string) {
    return this.deleteItem(SHAREPOINT_LISTS.MANDANTES, id);
  }
}

export class TrabajadoresService extends SharePointService {
  async getTrabajadores() {
    return this.getItems(SHAREPOINT_LISTS.TRABAJADORES);
  }

  async getTrabajadorById(id: string) {
    const items = await this.getItems(
      SHAREPOINT_LISTS.TRABAJADORES, 
      undefined, 
      `fields/id eq '${id}'`
    );
    return items.length > 0 ? items[0] : null;
  }

  async createTrabajador(data: Record<string, unknown>) {
    return this.createItem(SHAREPOINT_LISTS.TRABAJADORES, data);
  }

  async updateTrabajador(id: string, data: Record<string, unknown>) {
    return this.updateItem(SHAREPOINT_LISTS.TRABAJADORES, id, data);
  }

  async deleteTrabajador(id: string) {
    return this.deleteItem(SHAREPOINT_LISTS.TRABAJADORES, id);
  }
}

export class ServiciosService extends SharePointService {
  async getServicios() {
    return this.getItems(SHAREPOINT_LISTS.SERVICIOS);
  }

  async createServicio(data: Record<string, unknown>) {
    return this.createItem(SHAREPOINT_LISTS.SERVICIOS, data);
  }

  async updateServicio(id: string, data: Record<string, unknown>) {
    return this.updateItem(SHAREPOINT_LISTS.SERVICIOS, id, data);
  }

  async deleteServicio(id: string) {
    return this.deleteItem(SHAREPOINT_LISTS.SERVICIOS, id);
  }
}

export class VacacionesService extends SharePointService {
  async getVacaciones() {
    return this.getItems(SHAREPOINT_LISTS.VACACIONES);
  }

  async getVacacionesByTrabajador(trabajadorId: string) {
    return this.getItems(
      SHAREPOINT_LISTS.VACACIONES,
      undefined,
      `fields/trabajador_id eq '${trabajadorId}'`
    );
  }

  async createVacacion(data: Record<string, unknown>) {
    return this.createItem(SHAREPOINT_LISTS.VACACIONES, data);
  }

  async updateVacacion(id: string, data: Record<string, unknown>) {
    return this.updateItem(SHAREPOINT_LISTS.VACACIONES, id, data);
  }

  async deleteVacacion(id: string) {
    return this.deleteItem(SHAREPOINT_LISTS.VACACIONES, id);
  }
}

export class DirectivasService extends SharePointService {
  async getDirectivas() {
    return this.getItems(SHAREPOINT_LISTS.DIRECTIVAS);
  }

  async createDirectiva(data: Record<string, unknown>) {
    return this.createItem(SHAREPOINT_LISTS.DIRECTIVAS, data);
  }

  async updateDirectiva(id: string, data: Record<string, unknown>) {
    return this.updateItem(SHAREPOINT_LISTS.DIRECTIVAS, id, data);
  }

  async deleteDirectiva(id: string) {
    return this.deleteItem(SHAREPOINT_LISTS.DIRECTIVAS, id);
  }
}

export class UsuariosService extends SharePointService {
  async getUsuarios() {
    return this.getItems(SHAREPOINT_LISTS.USUARIOS);
  }

  async getUsuarioByEmail(email: string) {
    const items = await this.getItems(
      SHAREPOINT_LISTS.USUARIOS,
      undefined,
      `fields/email eq '${email}'`
    );
    return items.length > 0 ? items[0] : null;
  }

  async createUsuario(data: Record<string, unknown>) {
    return this.createItem(SHAREPOINT_LISTS.USUARIOS, data);
  }

  async updateUsuario(id: string, data: Record<string, unknown>) {
    return this.updateItem(SHAREPOINT_LISTS.USUARIOS, id, data);
  }

  async getRoles() {
    return this.getItems(SHAREPOINT_LISTS.ROLES);
  }

  async getPermisos() {
    return this.getItems(SHAREPOINT_LISTS.PERMISOS);
  }

  async getRolPermisos(rolId: string) {
    return this.getItems(
      SHAREPOINT_LISTS.ROL_PERMISOS,
      undefined,
      `fields/rol_id eq '${rolId}'`
    );
  }

  async assignPermissionToRole(rolId: string, permisoId: string) {
    return this.createItem(SHAREPOINT_LISTS.ROL_PERMISOS, {
      rol_id: rolId,
      permiso_id: permisoId
    });
  }
}

// Export service instances
export const mandantesService = new MandantesService();
export const trabajadoresService = new TrabajadoresService();
export const serviciosService = new ServiciosService();
export const vacacionesService = new VacacionesService();
export const directivasService = new DirectivasService();
export const usuariosService = new UsuariosService();
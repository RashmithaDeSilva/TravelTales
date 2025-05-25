import CacheStoreDAO from "../DAOs/CacheStoreDAO.mjs";
import RestCountryResponse from '../utils/responses/RestCountryResponse.mjs';


class CacheStoreService {
    constructor() {
        this.cacheStoreDAO = new CacheStoreDAO();
    }

    // Save data on cache store
    async saveCache(cacheStoreModel) {
        try {
            await this.cacheStoreDAO.save(cacheStoreModel);
        } catch (error) {
            throw error;
        }
    }

    // Get all country list
    async getAllCountryList() {
        try {
            const countrys = await this.cacheStoreDAO.getAllCountryList();
            return RestCountryResponse(countrys);
        } catch (error) {
            throw error;
        }
    }

    // Get all countries
    async getAllCountries() {
        try {
            const countrys = await this.cacheStoreDAO.getAllCountries();
            return RestCountryResponse(countrys);
        } catch (error) {
            throw error;
        }
    }

    // Get country by name (Partial Match)
    async getCountryByName(name) {
        try {
            const countrys = await this.cacheStoreDAO.getCountryByName(name);
            return RestCountryResponse(countrys);
        } catch (error) {
            throw error;
        }
    }

    // Get country by name (Partial Match)
    async getCountryByNameWithPageSize(data) {
        try {
            const countrys = await this.cacheStoreDAO.getCountryByNameWithPageSize(data.country, data.page, data.size);
            return RestCountryResponse(countrys);
        } catch (error) {
            // console.log(error);
            throw error;
        }
    }

    // Get country by currency (Partial Match)
    async getCountryByCurrency(currency) {
        try {
            const countrys = await this.cacheStoreDAO.getCountryByCurrency(currency);
            return RestCountryResponse(countrys);
        } catch (error) {
            throw error;
        }
    }

    // Get country by capital city (Partial Match)
    async getCountryByCapital(capital) {
        try {
            const countrys = await this.cacheStoreDAO.getCountryByCapital(capital);
            return RestCountryResponse(countrys);
        } catch (error) {
            throw error;
        }
    }

    // Get country by national flag (Exact Match)
    async getFlagByCountryName(name) {
        try {
            const countrys = await this.cacheStoreDAO.getFlagByCountryName(name);
            return RestCountryResponse(countrys);
        } catch (error) {
            throw error;
        }
    }

    // Verify country name
    async verifyCountry(name) {
        try {
            const result = await this.cacheStoreDAO.verifyCountry(name);
            return result;

        } catch (error) {
            throw error;
        }
    }

}

export default CacheStoreService;
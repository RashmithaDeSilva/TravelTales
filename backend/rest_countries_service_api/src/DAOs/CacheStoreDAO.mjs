import redisClient from '../config/RedisCon.mjs';

class CacheStoreDAO {
    constructor() {}

    // Save data in Redis
    async save(cacheStoreModel) {
        try {
            // Save data in Redis as a simple string
            await redisClient.set(cacheStoreModel.key, JSON.stringify(cacheStoreModel.value));
        } catch (error) {
            throw error;
        }
    }

    // Retrieve all cached countries
    async getAllCountries() {
        try {
            const result = await redisClient.get("cache:countries");
            return result ? JSON.parse(result) : [];
        } catch (error) {
            throw error;
        }
    }

    // Get all country list
    async getAllCountryList() {
        try {
            const allCountries = await this.getAllCountries();
            return allCountries.map(country => country.name.common);
        } catch (error) {
            throw error;
        }
    }

    // Get country using name (Partial Match)
    async getCountryByName(name) {
        try {
            const allCountries = await this.getAllCountries();
            return allCountries.filter(country =>
                country.name.common.toLowerCase().includes(name.toLowerCase())
            );
        } catch (error) {
            throw error;
        }
    }

    // Get country using name (Partial Match) with pagination
    async getCountryByNameWithPageSize(name, page = 1, size = 10) {
        try {
            const allCountries = await this.getAllCountryList();
            const filteredCountries = allCountries.filter(country =>
                country.toLowerCase().startsWith(name.toLowerCase())
            );

            const startIndex = (page - 1) * size;
            const endIndex = startIndex + size;

            const paginatedCountries = filteredCountries.slice(startIndex, endIndex);
            return paginatedCountries;
            
        } catch (error) {
            throw error;
        }
    }


    // Get country using currency information (Partial Match)
    async getCountryByCurrency(currency) {
        try {
            const allCountries = await this.getAllCountries();
            return allCountries.filter(country =>
                Object.keys(country.currencies || {}).some(curr =>
                    curr.toLowerCase().includes(currency.toLowerCase())
                )
            );
        } catch (error) {
            throw error;
        }
    }

    // Get country using capital city (Partial Match)
    async getCountryByCapital(capital) {
        try {
            const allCountries = await this.getAllCountries();
            return allCountries.filter(country =>
                country.capital && country.capital.some(cap =>
                    cap.toLowerCase().includes(capital.toLowerCase())
                )
            );
        } catch (error) {
            throw error;
        }
    }

    // Get flag using country name
    async getFlagByCountryName(name) {
        try {
            const allCountries = await this.getAllCountries();
            return allCountries
                .filter(country =>
                    country.name.common.toLowerCase().includes(name.toLowerCase())
                )
                .map(country => ({
                    name: country.name.common,
                    flags: country.flags
                }));
        } catch (error) {
            throw error;
        }
    }
    
    // Verify country name
    async verifyCountry(name) {
        try {
            const allCountries = await this.getAllCountries();

            // Normalize the name for comparison (case-insensitive)
            const inputName = name.trim().toLowerCase();

            // Check if any country has a matching name
            const isValid = allCountries.some(country => 
                country.name.common.toLowerCase() === inputName
            );
            return isValid;
            
        } catch (error) {
            throw error;
        }
    }

}

export default CacheStoreDAO;
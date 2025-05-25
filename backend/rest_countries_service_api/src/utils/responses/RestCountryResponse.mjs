const RestCountryResponse = (countrys) => {
    return {
        "countrys_count": countrys.length,
        "countrys": countrys,
    };
};

export default RestCountryResponse;
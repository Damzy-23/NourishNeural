const CARBON_FOOTPRINT_PER_KG = {
    'Meat': 15.0,
    'Dairy': 3.0,
    'Produce': 0.5,
    'Bakery': 1.0,
    'Frozen': 2.0,
    'Pantry': 1.2,
    'Beverages': 0.3,
    'General': 1.0
};

const WATER_FOOTPRINT_PER_KG = {
    'Meat': 15000,
    'Dairy': 3000,
    'Produce': 300,
    'Bakery': 1000,
    'Frozen': 800,
    'Pantry': 1200,
    'Beverages': 100,
    'General': 1000
};

// Assuming 1 item (if unit is pieces) averages to ~0.5kg for calculation purposes
const WEIGHT_ESTIMATE_KG = 0.5;

function calculateImpact(items) {
    let totalCarbonSaved = 0;
    let totalWaterSaved = 0;
    let totalMoneySaved = 0;

    items.forEach(item => {
        let weightKg = parseFloat(item.quantity) || 1;
        if (item.unit && item.unit.toLowerCase() === 'g') {
            weightKg = weightKg / 1000;
        } else if (item.unit && item.unit.toLowerCase() === 'lbs') {
            weightKg = weightKg * 0.453592;
        } else if (!item.unit || (item.unit.toLowerCase() !== 'kg' && item.unit.toLowerCase() !== 'l')) {
            weightKg = weightKg * WEIGHT_ESTIMATE_KG;
        }

        const category = item.category || 'General';
        const carbonFactor = CARBON_FOOTPRINT_PER_KG[category] || CARBON_FOOTPRINT_PER_KG['General'];
        const waterFactor = WATER_FOOTPRINT_PER_KG[category] || WATER_FOOTPRINT_PER_KG['General'];

        totalCarbonSaved += (weightKg * carbonFactor);
        totalWaterSaved += (weightKg * waterFactor);

        if (item.price) {
            totalMoneySaved += parseFloat(item.price);
        }
    });

    return {
        carbonSavedKg: parseFloat(totalCarbonSaved.toFixed(2)),
        waterSavedLiters: parseFloat(totalWaterSaved.toFixed(0)),
        moneySaved: parseFloat(totalMoneySaved.toFixed(2))
    };
}

function getBadgeForCarbon(carbonKg) {
    if (carbonKg >= 500) return { level: 5, title: 'Carbon Negative Hero', icon: '🌍' };
    if (carbonKg >= 250) return { level: 4, title: 'Eco-Warrior', icon: '🦸' };
    if (carbonKg >= 100) return { level: 3, title: 'Sustainability Champion', icon: '🏆' };
    if (carbonKg >= 50) return { level: 2, title: 'Green Thumbnail', icon: '🌿' };
    if (carbonKg >= 10) return { level: 1, title: 'Sprout', icon: '🌱' };
    return { level: 0, title: 'Seedling', icon: '🌰' };
}

module.exports = {
    calculateImpact,
    getBadgeForCarbon
};

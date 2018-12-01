const yearParser = d3.timeParse("%Y-%m-%d");
let heart;
let worldLegend;
let scatter;

function processDALYRow(d) {
    return {
        code: +d.code,
        cause_of_death_0: d.cause_of_death_0,
        cause_of_death_1: d.cause_of_death_1,
        cause_of_death_2: d.cause_of_death_2,
        cause_of_death_3: d.cause_of_death_3,
        cause_of_death_4: d.cause_of_death_4,
        total: +d.total,
        male_total: +d.male_total,
        female_total: +d.female_total,
        male_0_28_days: +d.male_0_28_days,
        male_1_59_months: +d.male_1_59_months,
        male_5_14_years: +d.male_5_14_years,
        male_15_29_years: +d.male_15_29_years,
        male_30_49_years: +d.male_30_49_years,
        male_50_59_years: +d.male_50_59_years,
        male_60_69_years: +d.male_60_69_years,
        male_70_plus_years: +d.male_70_plus_years,
        female_0_28_days: +d.female_0_28_days,
        female_1_59_months: +d.female_1_59_months,
        female_5_14_years: +d.female_5_14_years,
        female_15_29_years: +d.female_15_29_years,
        female_30_49_years: +d.female_30_49_years,
        female_50_59_years: +d.female_50_59_years,
        female_60_69_years: +d.female_60_69_years,
        female_70_plus_years: +d.female_70_plus_years,
        year: yearParser(d.year)
    }
}


const DALYStringColumns = ['sex', 'cause_of_death_0', 'cause_of_death_1', 'cause_of_death_2', 'cause_of_death_3',
    'cause_of_death_4', 'year'];

function processDALYCountryRow(d) {
    for (let key in d) {
        if (!DALYStringColumns.includes(key)) {
            if (d[key] === '.') {
                d[key] = 0;
            }
            d[key] = +d[key];
        }
        else if (key === 'year') {
            d[key] = yearParser(d[key]);
        }
    }
    return d;
}

function processBPRow(d) {
    return {
        country: d.country,
        region: d.region,
        year: +d.year,
        gender: d.gender,
        population: +d.population,
        CVD: +d.CVD,
        bloodPressure: +d.bloodpressure
    }
}


queue()
    .defer(d3.json, 'data/risk_factors.json')
    .defer(d3.json, 'data/continents.json')
    .defer(d3.csv, 'data/data_bp_combined_fixed.csv', processBPRow)
    .await(createVisualizations);


function createVisualizations(error, risk_factors, continents, bp_data) {
    const heartHeight = 2 * $('#view-3').height() / 3;
    heart = new BeatingHeart('#chart-area-2', risk_factors, heartHeight);
    scatter = new ScatterPlot('#chart-area-5', bp_data, '#world-legend', continents);
}

function filterScatter() {
    scatter.filterData();
}
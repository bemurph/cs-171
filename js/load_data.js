const yearParser = d3.timeParse("%Y-%m-%d");

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
    'cause_of_death_4'];

function processDALYCountryRow(d) {
    for (let key in d) {
        if (!DALYStringColumns.includes(key)) {
            if (d[key] === '.') {
                d[key] = 0;
            }
            d[key] = +d[key];
        }
    }
    return d;
}


queue()
    .defer(d3.csv, 'data/DALY_Global_2000.csv', processDALYRow)
    .defer(d3.csv, 'data/DALY_Global_2010.csv', processDALYRow)
    .defer(d3.csv, 'data/DALY_Global_2015.csv', processDALYRow)
    .defer(d3.csv, 'data/DALY_Global_2016.csv', processDALYRow)
    .defer(d3.csv, 'data/DALY-2000-country-all.csv', processDALYCountryRow)
    .await(printData);


function printData(error, daly_2000, daly_2010, daly_2015, daly_2016, daly_country_2000) {
    console.log(daly_2000);
    console.log(daly_2010);
    console.log(daly_2015);
    console.log(daly_2016);
    console.log(daly_country_2000);
}
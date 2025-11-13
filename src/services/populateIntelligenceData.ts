import { supabase } from './supabaseClient';
import {
  competitorProfilesData,
  competitorActivitiesData,
  marketShareData,
  pricingIntelligenceData,
  marketEntryBarriersData
} from './seedData/competitiveIntelligenceSeedData';
import {
  businessRegistrationData,
  taxIncentivesData,
  regulatoryPolicyData
} from './seedData/regulatoryComplianceSeedData';
import {
  politicalRisksData,
  economicRisksData,
  operationalRisksData
} from './seedData/riskAssessmentSeedData';
import {
  commercialPropertiesData,
  economicZonesData,
  infrastructureProjectsData
} from './seedData/realEstateLocationSeedData';
import {
  salaryBenchmarksData,
  laborMarketStatsData,
  recruitmentPartnersData
} from './seedData/laborTalentSeedData';

export class IntelligenceDataPopulator {
  private results: {
    table: string;
    inserted: number;
    errors: number;
    errorDetails?: any[];
  }[] = [];

  async populateAll(): Promise<void> {
    console.log('🚀 Starting data population...\n');

    await this.populateCompetitiveIntelligence();
    await this.populateRegulatoryCompliance();
    await this.populateRiskAssessment();
    await this.populateRealEstateLocation();
    await this.populateLaborTalent();

    this.printSummary();
  }

  private async populateCompetitiveIntelligence(): Promise<void> {
    console.log('📊 Populating Competitive Intelligence...');

    await this.insertData('competitor_profiles', competitorProfilesData);

    await this.insertData('competitor_activities', competitorActivitiesData);

    await this.insertData('market_share_tracking', marketShareData);

    await this.insertData('pricing_intelligence', pricingIntelligenceData);

    await this.insertData('market_entry_barriers', marketEntryBarriersData);
  }

  private async populateRegulatoryCompliance(): Promise<void> {
    console.log('\n📋 Populating Regulatory Compliance...');

    await this.insertData('business_registration_requirements', businessRegistrationData);

    await this.insertData('tax_incentive_programs', taxIncentivesData);

    await this.insertData('regulatory_policy_changes', regulatoryPolicyData);
  }

  private async populateRiskAssessment(): Promise<void> {
    console.log('\n⚠️  Populating Risk Assessment...');

    await this.insertData('political_risks', politicalRisksData);

    await this.insertData('economic_risks', economicRisksData);

    await this.insertData('operational_risks', operationalRisksData);
  }

  private async populateRealEstateLocation(): Promise<void> {
    console.log('\n🏢 Populating Real Estate & Location...');

    await this.insertData('commercial_properties', commercialPropertiesData);

    await this.insertData('economic_zones', economicZonesData);

    await this.insertData('infrastructure_projects', infrastructureProjectsData);
  }

  private async populateLaborTalent(): Promise<void> {
    console.log('\n👥 Populating Labor & Talent...');

    await this.insertData('salary_benchmarks', salaryBenchmarksData);

    await this.insertData('labor_market_statistics', laborMarketStatsData);

    await this.insertData('recruitment_partners', recruitmentPartnersData);
  }

  private async insertData(tableName: string, data: any[]): Promise<void> {
    try {
      console.log(`  ↳ Inserting ${data.length} records into ${tableName}...`);

      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select();

      if (error) {
        console.error(`    ❌ Error inserting into ${tableName}:`, error.message);
        this.results.push({
          table: tableName,
          inserted: 0,
          errors: data.length,
          errorDetails: [error]
        });
      } else {
        console.log(`    ✅ Successfully inserted ${result?.length || data.length} records`);
        this.results.push({
          table: tableName,
          inserted: result?.length || data.length,
          errors: 0
        });
      }
    } catch (err: any) {
      console.error(`    ❌ Exception inserting into ${tableName}:`, err.message);
      this.results.push({
        table: tableName,
        inserted: 0,
        errors: data.length,
        errorDetails: [err]
      });
    }
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 DATA POPULATION SUMMARY');
    console.log('='.repeat(60) + '\n');

    const totalInserted = this.results.reduce((sum, r) => sum + r.inserted, 0);
    const totalErrors = this.results.reduce((sum, r) => sum + r.errors, 0);

    console.log(`Total records inserted: ${totalInserted}`);
    console.log(`Total errors: ${totalErrors}\n`);

    console.log('By Table:');
    console.log('-'.repeat(60));

    this.results.forEach(result => {
      const status = result.errors === 0 ? '✅' : '❌';
      console.log(`${status} ${result.table.padEnd(40)} ${result.inserted} inserted, ${result.errors} errors`);
    });

    console.log('\n' + '='.repeat(60));

    if (totalErrors > 0) {
      console.log('\n⚠️  Some tables had errors. Check the console output above for details.');
    } else {
      console.log('\n🎉 All data successfully populated!');
    }
  }

  async clearAllData(): Promise<void> {
    console.log('🗑️  Clearing all intelligence data...\n');

    const tables = [
      'competitor_profiles',
      'competitor_activities',
      'market_share_tracking',
      'pricing_intelligence',
      'market_entry_barriers',
      'business_registration_requirements',
      'tax_incentive_programs',
      'regulatory_policy_changes',
      'political_risks',
      'economic_risks',
      'operational_risks',
      'commercial_properties',
      'economic_zones',
      'infrastructure_projects',
      'salary_benchmarks',
      'labor_market_statistics',
      'recruitment_partners'
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) {
          console.log(`  ❌ Error clearing ${table}: ${error.message}`);
        } else {
          console.log(`  ✅ Cleared ${table}`);
        }
      } catch (err: any) {
        console.log(`  ❌ Exception clearing ${table}: ${err.message}`);
      }
    }

    console.log('\n✅ Data clearing complete');
  }
}

export const runDataPopulation = async (clearFirst: boolean = false): Promise<void> => {
  const populator = new IntelligenceDataPopulator();

  if (clearFirst) {
    await populator.clearAllData();
    console.log('\n');
  }

  await populator.populateAll();
};

if (typeof window === 'undefined') {
  runDataPopulation(true).catch(console.error);
}

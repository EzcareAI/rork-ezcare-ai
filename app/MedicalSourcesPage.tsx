import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";

export default function MedicalSourcesPage() {
  const openUrl = (url: string): void => {
    Linking.openURL(url).catch((err: unknown) =>
      console.error("Couldn't load page", err)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Sources</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          This page lists the official guidelines, scientific studies and
          references used as background for EzCare AI content. All links are
          clickable. The full sources PDF is available for download at the
          bottom.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Section 1 — Official Cancer & Screening Guidelines
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl(
                "https://www.uspreventiveservicestaskforce.org/uspstf/topic_search_results"
              )
            }
          >
            US Preventive Services Task Force – Cancer Screening
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl(
                "https://www.cancer.gov/about-cancer/causes-prevention/genetics/genetic-testing-fact-sheet"
              )
            }
          >
            NCI – Genetic Testing for Inherited Cancer Susceptibility Syndromes
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl(
                "https://www.cancer.gov/about-cancer/screening/research/what-screening-statistics-mean"
              )
            }
          >
            NCI – What Cancer Screening Statistics Really Mean
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl(
                "https://www.cancer.org/research/cancer-facts-statistics/all-cancer-facts-figures/cancer-facts-figures-2022.html"
              )
            }
          >
            American Cancer Society (ACS) – Cancer Facts & Figures 2022
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl(
                "https://www.nccn.org/patientresources/patient-resources/guidelines-for-patients"
              )
            }
          >
            NCCN – Guidelines for Patients
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Section 2 — Multi-Cancer Early Detection & Screening
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl(
                "https://www.uspreventiveservicestaskforce.org/uspstf/topic_search_results"
              )
            }
          >
            USPSTF – Screening Recommendations (multi-cancer screening refs)
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl(
                "https://www.cancer.gov/about-cancer/causes-prevention/genetics/genetic-testing-fact-sheet"
              )
            }
          >
            NCI – Genetic Testing (MCED references)
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl(
                "https://www.cancer.org/research/cancer-facts-statistics/all-cancer-facts-figures/cancer-facts-figures-2022.html"
              )
            }
          >
            ACS – Cancer Facts & Figures (MCED background)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Section 3 — Clinical Studies & Reviews (examples)
          </Text>

          <Text
            style={styles.link}
            onPress={() => openUrl("https://pubmed.ncbi.nlm.nih.gov/27536105/")}
          >
            Intravenous Vitamin C & related mechanisms — PubMed
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl("https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3558162/")
            }
          >
            Vitamin C mechanistic review — PMC article
          </Text>

          <Text
            style={styles.link}
            onPress={() => openUrl("https://pubmed.ncbi.nlm.nih.gov/30670028/")}
          >
            Vitamin C – Cancer mechanistic work — PubMed
          </Text>

          <Text
            style={styles.link}
            onPress={() => openUrl("https://pubmed.ncbi.nlm.nih.gov/30257366/")}
          >
            Modified Citrus Pectin & Galectin-3 — PubMed
          </Text>

          <Text
            style={styles.link}
            onPress={() => openUrl("https://pubmed.ncbi.nlm.nih.gov/16232154/")}
          >
            Feverfew / Parthenolide (leukemia/myeloma studies) — PubMed
          </Text>

          <Text
            style={styles.link}
            onPress={() => openUrl("https://pubmed.ncbi.nlm.nih.gov/18520030/")}
          >
            Sulforaphane & Cruciferous Vegetables — PubMed
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl("https://doi.org/10.1158/1078-0432.CCR-04-0308")
            }
          >
            Calorie restriction & cancer (Clin Cancer Res)
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl("https://www.nature.com/articles/s41568-019-0135-7")
            }
          >
            Review — Tumor and cancer research perspectives — Nature Reviews
          </Text>

          <Text
            style={styles.link}
            onPress={() => openUrl("https://pubmed.ncbi.nlm.nih.gov/19235043/")}
          >
            Intermittent calorie restriction – TRAMP mice (example PubMed)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Section 4 — Survivorship, Life After Cancer & Young Adult Issues
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl(
                "https://www.nccn.org/patientresources/patient-resources/guidelines-for-patients"
              )
            }
          >
            NCCN – Guidelines for Patients (survivorship)
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl(
                "https://www.cancer.org/cancer/managing-cancer/side-effects/fertility-and-sexual-side-effects.html"
              )
            }
          >
            ACS – Fertility & Sexual Side Effects of Cancer Treatment
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl(
                "https://www.cancer.org/cancer/survivorship/long-term-health-concerns/second-cancers-in-adults.html"
              )
            }
          >
            ACS – Second Cancers in Adults
          </Text>

          <Text
            style={styles.link}
            onPress={() => openUrl("http://www.survivorshipguidelines.org/")}
          >
            Children’s Oncology Group – Long-Term Follow-Up Guidelines
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other research & resources</Text>

          <Text
            style={styles.link}
            onPress={() => openUrl("https://pubmed.ncbi.nlm.nih.gov/30274079/")}
          >
            Example PubMed — related articles (from PDF)
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl("https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6115501/")
            }
          >
            Mechanistic vitamin C research — PMC
          </Text>

          <Text
            style={styles.link}
            onPress={() =>
              openUrl(
                "https://sciencebasedmedicine.org/high-dose-vitamin-c-and-cancer-has-linus-pauling-been-vindicated/"
              )
            }
          >
            Critical review: High-dose vitamin C and cancer (Science-Based
            Medicine)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1F2937" },
  content: { flex: 1, paddingHorizontal: 20, paddingVertical: 20 },
  intro: { fontSize: 16, color: "#4B5563", lineHeight: 24, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  link: {
    fontSize: 15,
    color: "#2563EB",
    textDecorationLine: "underline",
    marginBottom: 8,
  },
  smallNote: { marginTop: 8, color: "#6B7280", fontSize: 13 },
  pdfNote: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 13,
    textAlign: "center",
  },
});

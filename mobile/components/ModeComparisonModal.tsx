import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';

interface ModeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModeComparisonModal: React.FC<ModeComparisonModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.modalContainer} 
          activeOpacity={1}
          onPress={() => {}}
        >
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Investra</Text>
                  <Text style={styles.ultraText}>Ultra</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.introSection}>
                <Text style={styles.introTitle}>Choose Your Experience</Text>
                <Text style={styles.introSubtitle}>
                  Investra offers two powerful modes to help you with your financial questions. Select the mode that best fits your needs.
                </Text>
              </View>

              {/* Mode Comparison */}
              <View style={styles.comparisonContainer}>
                {/* Base Mode */}
                <View style={styles.baseModeCard}>
                  <View style={styles.modeHeader}>
                    <View style={styles.modeIcon}>
                      <Text style={styles.modeIconText}>📄</Text>
                    </View>
                    <View>
                      <Text style={styles.modeTitle}>Base Mode</Text>
                      <Text style={styles.modeSubtitle}>Document-Based AI</Text>
                    </View>
                  </View>
                  
                  <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                      <View style={styles.checkIcon}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                      <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>Pre-loaded financial document</Text>
                        <Text style={styles.featureDescription}>Access to "The Basics for Investing in Stocks" guide</Text>
                      </View>
                    </View>
                    
                    <View style={styles.featureItem}>
                      <View style={styles.checkIcon}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                      <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>Smart citations</Text>
                        <Text style={styles.featureDescription}>Clickable page references with source links</Text>
                      </View>
                    </View>
                    
                    <View style={styles.featureItem}>
                      <View style={styles.checkIcon}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                      <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>Focused responses</Text>
                        <Text style={styles.featureDescription}>Answers based solely on the loaded document</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.perfectFor}>
                    <Text style={styles.perfectForText}>
                      <Text style={styles.perfectForBold}>Perfect for:</Text> Learning investment basics, understanding stock fundamentals, and getting reliable information from trusted sources.
                    </Text>
                  </View>
                </View>

                {/* Ultra Mode */}
                <View style={styles.ultraModeCard}>
                  <View style={styles.modeHeader}>
                    <View style={styles.ultraModeIcon}>
                      <Text style={styles.ultraModeIconText}>⚡</Text>
                    </View>
                    <View style={styles.ultraTitleContainer}>
                      <Text style={styles.ultraText}>Ultra</Text>
                      <Text style={styles.ultraModeTitle}>Mode</Text>
                    </View>
                  </View>
                  
                  <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                      <View style={styles.checkIcon}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                      <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>Everything from Base mode</Text>
                        <Text style={styles.featureDescription}>Includes document RAG, smart citations, and focused responses</Text>
                      </View>
                    </View>
                    
                    <View style={styles.featureItem}>
                      <View style={[styles.checkIcon, styles.purpleCheck]}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                      <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>Real-time stock data</Text>
                        <Text style={[styles.featureDescription, styles.purpleText]}>Live stock prices, charts, and market information</Text>
                      </View>
                    </View>
                    
                    <View style={styles.featureItem}>
                      <View style={[styles.checkIcon, styles.blueCheck]}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                      <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>Web search integration</Text>
                        <Text style={[styles.featureDescription, styles.blueText]}>Access to latest financial news and market trends</Text>
                      </View>
                    </View>
                    
                    <View style={styles.featureItem}>
                      <View style={styles.checkIcon}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                      <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>Comprehensive analysis</Text>
                        <Text style={styles.featureDescription}>Combines document knowledge with current market data</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.ultraPerfectFor}>
                    <Text style={styles.ultraPerfectForText}>
                      <Text style={styles.ultraPerfectForBold}>Perfect for:</Text> Active investors, market research, current events analysis, and getting the most up-to-date financial information.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.getStartedButton}
                  onPress={onClose}
                >
                  <Text style={styles.getStartedText}>Get Started with Investra</Text>
                </TouchableOpacity>
                <Text style={styles.footerNote}>
                  You can switch between modes anytime using the toggle in the top-right corner
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#111827',
    borderRadius: 16,
    maxHeight: '90%',
    width: '100%',
    borderWidth: 1,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerContent: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  ultraText: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  content: {
    padding: 24,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  introSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  comparisonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  baseModeCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
    padding: 20,
  },
  ultraModeCard: {
    backgroundColor: '#000000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
    padding: 20,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  modeIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIconText: {
    fontSize: 20,
  },
  ultraModeIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ultraModeIconText: {
    fontSize: 20,
    color: '#10b981',
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modeSubtitle: {
    fontSize: 12,
    color: '#60a5fa',
    fontWeight: '600',
  },
  ultraTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  ultraModeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  featuresList: {
    gap: 16,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 12,
  },
  checkIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#10b981',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  purpleCheck: {
    backgroundColor: '#a78bfa',
  },
  blueCheck: {
    backgroundColor: '#60a5fa',
  },
  checkText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 16,
  },
  purpleText: {
    color: '#a78bfa',
  },
  blueText: {
    color: '#60a5fa',
  },
  perfectFor: {
    backgroundColor: '#1d4ed8',
    padding: 16,
    borderRadius: 8,
  },
  perfectForText: {
    fontSize: 12,
    color: '#dbeafe',
    lineHeight: 16,
  },
  perfectForBold: {
    fontWeight: '600',
    color: '#93c5fd',
  },
  ultraPerfectFor: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#10b981',
    padding: 16,
    borderRadius: 8,
  },
  ultraPerfectForText: {
    fontSize: 12,
    color: '#6ee7b7',
    lineHeight: 16,
  },
  ultraPerfectForBold: {
    fontWeight: '600',
    color: '#10b981',
  },
  footer: {
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default ModeComparisonModal; 
import React, { useState, useMemo } from 'react';
import { PillChip, FrostedCard, AmbientBg } from '@ds/components';
import { colors, spacing, typography, radii, shadows, animation } from '@ds/tokens';
import { Wheat, Leaf, CloudRain, TrendingUp, Bug, Search } from '@ds/icons';
import { useChatContext } from '../contexts/ChatContext';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * ExploreScreen - Content discovery
 * Browse agricultural articles organized by category
 * 
 * Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7
 */
const ExploreScreen = ({ onNavigate }) => {
  const { sendMessage } = useChatContext();
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Category configuration with icons
  // Requirement 28.1: Display article categories using PillChip components
  // Requirement 28.3: Use appropriate icons for categories
  const categories = [
    {
      id: 'all',
      label: language === 'hi' ? 'सभी' : 'All',
      icon: null,
    },
    {
      id: 'crops',
      label: language === 'hi' ? 'फसलें' : 'Crops',
      icon: <Wheat size={16} color={selectedCategory === 'crops' ? colors.text.onGreen : colors.text.primary} />,
    },
    {
      id: 'soil',
      label: language === 'hi' ? 'मिट्टी' : 'Soil',
      icon: <Leaf size={16} color={selectedCategory === 'soil' ? colors.text.onGreen : colors.text.primary} />,
    },
    {
      id: 'weather',
      label: language === 'hi' ? 'मौसम' : 'Weather',
      icon: <CloudRain size={16} color={selectedCategory === 'weather' ? colors.text.onGreen : colors.text.primary} />,
    },
    {
      id: 'market',
      label: language === 'hi' ? 'बाजार' : 'Market',
      icon: <TrendingUp size={16} color={selectedCategory === 'market' ? colors.text.onGreen : colors.text.primary} />,
    },
    {
      id: 'pests',
      label: language === 'hi' ? 'कीट' : 'Pests',
      icon: <Bug size={16} color={selectedCategory === 'pests' ? colors.text.onGreen : colors.text.primary} />,
    },
  ];

  // Sample articles for demonstration
  // Requirement 28.2: Show featured articles in FrostedCard containers
  const articles = useMemo(() => {
    if (language === 'hi') {
      return [
        {
          id: '1',
          title: 'गेहूं की खेती के लिए सर्वोत्तम प्रथाएं',
          category: 'crops',
          query: 'गेहूं की खेती के बारे में बताएं',
          borderColor: colors.green.default,
        },
        {
          id: '2',
          title: 'मिट्टी की नमी को कैसे बनाए रखें',
          category: 'soil',
          query: 'मिट्टी की नमी बनाए रखने के तरीके',
          borderColor: colors.status.success,
        },
        {
          id: '3',
          title: 'मानसून के मौसम की तैयारी',
          category: 'weather',
          query: 'मानसून के लिए खेत की तैयारी कैसे करें',
          borderColor: colors.status.info,
        },
        {
          id: '4',
          title: 'आज के बाजार भाव और रुझान',
          category: 'market',
          query: 'आज के बाजार भाव दिखाएं',
          borderColor: colors.saffron.default,
        },
        {
          id: '5',
          title: 'कीटों से फसल की सुरक्षा',
          category: 'pests',
          query: 'फसल में कीट नियंत्रण के उपाय',
          borderColor: colors.status.pest,
        },
        {
          id: '6',
          title: 'धान की रोपाई का सही समय',
          category: 'crops',
          query: 'धान की रोपाई कब करें',
          borderColor: colors.green.default,
        },
        {
          id: '7',
          title: 'जैविक खाद के फायदे',
          category: 'soil',
          query: 'जैविक खाद के बारे में बताएं',
          borderColor: colors.status.success,
        },
        {
          id: '8',
          title: 'सूखे से निपटने के उपाय',
          category: 'weather',
          query: 'सूखे में फसल कैसे बचाएं',
          borderColor: colors.status.info,
        },
      ];
    } else {
      return [
        {
          id: '1',
          title: 'Best Practices for Wheat Cultivation',
          category: 'crops',
          query: 'Tell me about wheat cultivation',
          borderColor: colors.green.default,
        },
        {
          id: '2',
          title: 'How to Maintain Soil Moisture',
          category: 'soil',
          query: 'Ways to maintain soil moisture',
          borderColor: colors.status.success,
        },
        {
          id: '3',
          title: 'Preparing for Monsoon Season',
          category: 'weather',
          query: 'How to prepare farm for monsoon',
          borderColor: colors.status.info,
        },
        {
          id: '4',
          title: 'Today\'s Market Prices and Trends',
          category: 'market',
          query: 'Show today\'s market prices',
          borderColor: colors.saffron.default,
        },
        {
          id: '5',
          title: 'Protecting Crops from Pests',
          category: 'pests',
          query: 'Pest control measures for crops',
          borderColor: colors.status.pest,
        },
        {
          id: '6',
          title: 'Right Time for Rice Transplanting',
          category: 'crops',
          query: 'When to transplant rice',
          borderColor: colors.green.default,
        },
        {
          id: '7',
          title: 'Benefits of Organic Fertilizers',
          category: 'soil',
          query: 'Tell me about organic fertilizers',
          borderColor: colors.status.success,
        },
        {
          id: '8',
          title: 'Dealing with Drought Conditions',
          category: 'weather',
          query: 'How to save crops during drought',
          borderColor: colors.status.info,
        },
      ];
    }
  }, [language]);

  // Filter articles by selected category
  // Requirement 28.4: Filter articles by category
  const filteredArticles = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') {
      return articles;
    }
    return articles.filter((article) => article.category === selectedCategory);
  }, [articles, selectedCategory]);

  // Handle category selection
  // Requirement 28.4: Use #138808 for active state
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  // Handle article click
  // Requirement 28.5: Send article as chat query and navigate to ChatScreen
  const handleArticleClick = async (article) => {
    try {
      await sendMessage(article.query);
      // Navigate to chat screen
      if (onNavigate) {
        onNavigate('chat');
      }
    } catch (error) {
      console.error('Failed to send article query:', error);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient */}
      <AmbientBg />

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          paddingBottom: '80px', // Space for bottom navigation
          animation: `fadeUp ${animation.duration.slow} ${animation.easing.default}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: spacing.screenPadding,
            paddingBottom: spacing['6'],
          }}
        >
          <h1
            style={{
              fontFamily: typography.fonts.serif,
              fontSize: typography.size['2xl'],
              fontWeight: typography.weight.semibold,
              color: colors.text.primary,
              marginBottom: spacing['2'],
            }}
          >
            {language === 'hi' ? 'खोजें' : 'Explore'}
          </h1>
          <p
            style={{
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.base,
              color: colors.text.secondary,
            }}
          >
            {language === 'hi' ? 'कृषि लेख और सलाह' : 'Agricultural articles and advice'}
          </p>
        </div>

        {/* Category filters */}
        {/* Requirement 28.1: Display article categories using PillChip components */}
        <div
          style={{
            paddingLeft: spacing.screenPadding,
            paddingRight: spacing.screenPadding,
            marginBottom: spacing['6'],
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: spacing['2'],
              overflowX: 'auto',
              paddingBottom: spacing['2'],
              // Hide scrollbar but keep functionality
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                style={{
                  flex: '0 0 auto',
                }}
              >
                <PillChip
                  label={category.label}
                  active={selectedCategory === category.id || (selectedCategory === null && category.id === 'all')}
                  onPress={() => handleCategoryClick(category.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Articles list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingLeft: spacing.screenPadding,
            paddingRight: spacing.screenPadding,
          }}
        >
          {filteredArticles.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing['4'],
                paddingBottom: spacing['6'],
              }}
            >
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article)}
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Requirement 28.2: Show featured articles in FrostedCard containers with colored left borders */}
                  <FrostedCard
                    accentColor={article.borderColor}
                    style={{
                      padding: spacing.cardPadding,
                    }}
                  >
                    {/* Requirement 28.7: Use Lora serif font for article titles */}
                    <h3
                      style={{
                        fontFamily: typography.fonts.serif,
                        fontSize: typography.size.lg,
                        fontWeight: typography.weight.medium,
                        color: colors.text.primary,
                        lineHeight: typography.leading.snug,
                        margin: 0,
                      }}
                    >
                      {article.title}
                    </h3>
                  </FrostedCard>
                </div>
              ))}
            </div>
          ) : (
            // Requirement 28.6: Display empty state with Search icon when no articles match filters
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                padding: spacing['8'],
              }}
            >
              <Search
                size={64}
                color={colors.text.tertiary}
                style={{
                  marginBottom: spacing['6'],
                  opacity: 0.3,
                }}
              />
              <p
                style={{
                  fontFamily: typography.fonts.sans,
                  fontSize: typography.size.lg,
                  color: colors.text.secondary,
                }}
              >
                {language === 'hi' ? 'कोई लेख नहीं मिला' : 'No articles found'}
              </p>
              <p
                style={{
                  fontFamily: typography.fonts.sans,
                  fontSize: typography.size.base,
                  color: colors.text.tertiary,
                  marginTop: spacing['2'],
                }}
              >
                {language === 'hi' ? 'अन्य श्रेणी चुनें' : 'Try selecting a different category'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hide scrollbar for category filters */}
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default ExploreScreen;

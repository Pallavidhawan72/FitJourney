const axios = require('axios');

// Service for finding wellness videos
class YoutubeService {
    constructor() {
    // Use YouTube API to find yoga and meditation videos
        this.apiKey = process.env.YOUTUBE_API_KEY;
        this.baseURL = 'https://www.googleapis.com/youtube/v3';
        
    // Cache videos to avoid exceeding quota limits
        this.videoCache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    }

    // Check if cached videos are still valid
    isCacheValid(cacheKey) {
        const cached = this.videoCache.get(cacheKey);
        if (!cached) return false;
        
        const now = Date.now();
        return (now - cached.timestamp) < this.cacheExpiry;
    }

    // Create a unique cache key for video requests
    getCacheKey(type, duration) {
        return `${type}_${duration}`;
    }

    async getYogaVideos(type = 'yoga', duration = 'medium') {
    // Check for cached videos before making API request
        const cacheKey = this.getCacheKey(type, duration);
        if (this.isCacheValid(cacheKey)) {
            console.log(`Using cached videos for ${type} (${duration})`);
            return this.videoCache.get(cacheKey).videos;
        }

        // I first check if we have a valid API key
        if (!this.apiKey) {
            console.warn('YouTube API key not configured, returning empty array');
            return [];
        }

        try {
            let query = type;
            let maxResults = 10;
            let videoDuration = 'medium';

            // I customize the search based on what type of wellness content you want
            if (type === 'yoga') {
                query = 'yoga for beginners home workout';
            } else if (type === 'meditation') {
                query = 'guided meditation relaxation';
            } else if (type === 'stretching') {
                query = 'stretching exercises flexibility';
            }

            // I adjust results based on how much time you have available
            if (duration === 'short') {
                videoDuration = 'short';
                maxResults = 8;
            } else if (duration === 'long') {
                videoDuration = 'long';
                maxResults = 6;
            }

            console.log(`Fetching YouTube videos: ${query}, duration: ${videoDuration}`);

            const response = await axios.get(`${this.baseURL}/search`, {
                params: {
                    part: 'snippet',
                    q: query,
                    type: 'video',
                    videoDuration: videoDuration,
                    maxResults: maxResults,
                    key: this.apiKey,
                    relevanceLanguage: 'en',
                    videoEmbeddable: true,
                    order: 'relevance' // I get the most relevant videos first
                }
            });

            if (response.data.items && response.data.items.length > 0) {
                console.log(`Successfully fetched ${response.data.items.length} videos from YouTube API`);
                
                // I format the video data to make it easy to display and use
                const videos = response.data.items.map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    thumbnail: item.snippet.thumbnails.medium.url,
                    channelTitle: item.snippet.channelTitle,
                    publishedAt: item.snippet.publishedAt,
                    duration: duration,
                    type: type
                }));

                // I cache the videos to avoid hitting quota limits repeatedly
                this.videoCache.set(cacheKey, {
                    videos: videos,
                    timestamp: Date.now()
                });

                return videos;
            } else {
                console.warn('YouTube API returned no videos, returning empty array');
                return [];
            }
        } catch (error) {
            console.error('YouTube API error:', error.response?.data || error.message);
            
            // I check if it's a quota error specifically
            if (error.response?.data?.error?.message?.includes('quota')) {
                console.log('YouTube quota exceeded - will reset tomorrow! Returning empty array.');
            }
            
            // I return an empty array when API fails
            console.log('No fallback videos configured - returning empty array');
            return [];
        }
    }

    getFallbackVideos(type, duration) {
        console.log(`No fallback videos configured for type: ${type}, duration: ${duration}`);
        
        // returning an empty array when no API videos are available
        return [];
    }

    async getVideoDetails(videoId) {
        try {
            const response = await axios.get(`${this.baseURL}/videos`, {
                params: {
                    part: 'snippet,contentDetails,statistics',
                    id: videoId,
                    key: this.apiKey
                }
            });

            return response.data.items[0];
        } catch (error) {
            console.error('Error fetching video details:', error);
            throw error;
        }
    }

    // I added this method to test if the YouTube API is working properly
    async testApiConnection() {
        if (!this.apiKey) {
            return { success: false, error: 'No API key configured' };
        }

        try {
            const response = await axios.get(`${this.baseURL}/search`, {
                params: {
                    part: 'snippet',
                    q: 'yoga',
                    type: 'video',
                    maxResults: 1,
                    key: this.apiKey
                }
            });

            return { 
                success: true, 
                message: 'YouTube API connection successful',
                quota: response.headers['x-ratelimit-remaining'] || 'unknown'
            };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error?.message || error.message 
            };
        }
    }
}

module.exports = new YoutubeService(); 
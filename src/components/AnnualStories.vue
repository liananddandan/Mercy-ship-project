<template>
    <div class="annual-stories">
        <div class="story-viewer">
            <button class="nav-btn left" @click="prevStory" :disabled="currentIndex === 0">&#9664;</button>

            <div class="story-content">
                <div class="image-row">
                    <img v-for="(img, idx) in currentStory.images" :key="idx" :src="img" :alt="currentStory.title"
                        class="story-image" />
                </div>

                <h3 class="story-title">{{ currentStory.title }}</h3>
                <p class="story-text">{{ currentStory.description }}</p>
            </div>

            <button class="nav-btn right" @click="nextStory"
                :disabled="currentIndex === stories.length - 1">&#9654;</button>
        </div>

        <div class="story-indicator">
            {{ currentIndex + 1 }} / {{ stories.length }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const stories = [
    {
        title: 'Global Mercy & Africa Mercy',
        description: 'The world’s largest non-government hospital ship, with a volunteer crew of 640, is empowering a whole new generation to make a difference in their world. The  Global Mercy is the first hospital ship built specifically for the needs of our humanitarian work, allowing Mercy Ships to double our impact on the African continent, and to carry out a mission in two different countries simultaneously. \n The Africa Mercy was deployed to serve sub-Saharan Africa since 2007. This former ferry was converted by Mercy Ships into a floating hospital with 5 operating rooms and 82 hospital beds, and all the axillary hospital services required. The volunteer crew of 460 makes it possible to offer surgeries of a level equivalent to those that can be obtained in New Zealand, while docked in low-income countries.',
        images: [
            '/images/stories/ship1.webp',
            '/images/stories/ship2.webp',
        ],
    },
    {
        title: 'A New Smile and A New Future After a Surgery Onboard a Hospital Ship',
        description: 'After three long years of waiting, hope was finally on the horizon once again. Ramata heard that Mercy Ships would return to Senegal, so the mother and daughter journeyed to Dakar. Once they arrived, Ramata heard the words she’d longed for: Kadidja was cleared for surgery. She was overwhelmed by the love her daughter received from Mercy Ships’ volunteers. \n “Since I left my village and came to the ship, it felt like I have been in my own home. The volunteers working on the ship and in the HOPE Center are doing a great job. They welcomed me and my daughter with great respect. I was so happy to be there because everyone loved my daughter.”',
        images: [
            '/images/stories/patiente-1.webp',
            '/images/stories/patiente-2.webp',
            '/images/stories/patiente-3.webp',
        ],
    },
    {
        title: 'Sinclair Carter - Second Engineer \n Kathy Carter - Technical Administrator',
        description: 'The Carters first joined the small pioneering crew on board the Global Mercy as the vessel was nearing the end of the shipyard build in early 2021, and they were part of the inaugural crew as the world’s only purpose-built civilian hospital ship vessel slipped her berth in August, beginning the first international voyage. They are now on their 4th voyage with Mercy Ships.',
        images: [
            '/images/stories/volunteer-carter1.webp',
            '/images/stories/volunteer-carter2.webp',
            '/images/stories/volunteer-carter3.webp',
        ],
    },
];

const currentIndex = ref(0);
const currentStory = computed(() => stories[currentIndex.value]);

function prevStory() {
    if (currentIndex.value > 0) currentIndex.value--;
}

function nextStory() {
    if (currentIndex.value < stories.length - 1) currentIndex.value++;
}
</script>

<style scoped>
.annual-stories {
    max-width: 900px;
    margin: 2rem auto;
    background: white;
    border-radius: 12px;
    padding: 1.5rem 2rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    font-family: Arial, sans-serif;
    user-select: none;
    box-sizing: border-box;
    /* 加这个，推荐 */
}

.story-viewer {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    /* 适当减小间隙 */
    overflow: hidden;
    /* 防止溢出 */
    padding: 0 0.5rem;
    /* 给左右留点空间 */
    box-sizing: border-box;
}

.nav-btn {
    background: #2563eb;
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 1.6rem;
    /* 稍微小一点 */
    width: 42px;
    /* 缩小宽度 */
    height: 42px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s ease;
    flex-shrink: 0;
}

.nav-btn:disabled {
    background: #a3bffa;
    cursor: not-allowed;
}

.nav-btn:hover:not(:disabled) {
    background: #1e40af;
}

.nav-btn.left {
    order: 0;
}

.nav-btn.right {
    order: 2;
}

.story-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.image-row {
    display: flex;
    gap: 1rem;
    flex-wrap: nowrap;
    overflow-x: auto;
    max-width: 100%;
    margin-bottom: 1rem;
}

.story-image {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    user-select: none;
    flex-shrink: 0;
}

.story-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: #1e3a8a;
    margin: 0.5rem 0 0.25rem 0;
    text-align: center;
    white-space: pre-line;

}

.story-text {
    font-size: 1.1rem;
    color: #444;
    text-align: center;
    margin: 0;
    white-space: pre-line;
}

.story-indicator {
    text-align: center;
    margin-top: 0.75rem;
    color: #777;
    font-weight: 500;
    user-select: none;
}
</style>
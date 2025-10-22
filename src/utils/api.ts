// API utilities for fetching live data

const API_BASE = import.meta.env.PUBLIC_API_BASE || '';

export interface LiveVotes {
  [projectId: string]: number;
}

export interface LiveIdea {
  id: string;
  title: string;
  description: string;
  categories: string[];
  votes: number;
  createdAt: string;
}

export async function fetchVoteCounts(): Promise<LiveVotes> {
  try {
    const response = await fetch(`${API_BASE}/api/votes`);
    if (!response.ok) {
      throw new Error(`Failed to fetch votes: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching vote counts:', error);
    return {};
  }
}

export async function fetchLiveIdeas(): Promise<LiveIdea[]> {
  try {
    const response = await fetch(`${API_BASE}/api/ideas`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ideas: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return [];
  }
}

export async function updateVoteCount(elementId: string, projectId: string) {
  const votes = await fetchVoteCounts();
  const count = votes[projectId] || 0;
  const element = document.querySelector(`[data-id="${projectId}"] .vote-count`);
  if (element) {
    element.textContent = String(count);
  }
}
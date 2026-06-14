---
layout: page
---

<script setup>
import { VPTeamPage, VPTeamPageTitle, VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/bgraokmush.png',
    name: 'Bugra Okumus',
    title: 'Creator',
    desc: 'Building Curvhex ORM and Solana developer tooling.',
    links: [
      { icon: 'github', link: 'https://github.com/bgraokmush' },
    ],
  },
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>Team</template>
    <template #lead>Curvhex ORM is built and maintained by a small team passionate about making Solana development more ergonomic.</template>
  </VPTeamPageTitle>
  <VPTeamMembers :members="members" />
</VPTeamPage>

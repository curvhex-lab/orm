---
layout: page
---

<script setup>
import { VPTeamPage, VPTeamPageTitle, VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/bgraokmush.png',
    name: 'Bugra Okumus',
    title: 'Yaratıcı',
    desc: 'Curvhex ORM ve Solana geliştirici araçlarını inşa ediyor.',
    links: [
      { icon: 'github', link: 'https://github.com/bgraokmush' },
    ],
  },
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>Ekip</template>
    <template #lead>Curvhex ORM, Solana geliştirmeyi daha ergonomik hale getirme tutkusuyla çalışan küçük bir ekip tarafından oluşturulmakta ve sürdürülmektedir.</template>
  </VPTeamPageTitle>
  <VPTeamMembers :members="members" />
</VPTeamPage>

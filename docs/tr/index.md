---
layout: home

hero:
  name: "Curvhex ORM"
  text: "Solana PDA'ları için Prisma"
  tagline: Tanıdık bir TypeScript API'siyle zincir üstü hesapları sorgula, filtrele ve agrege et. RPC'den Helius'a, oradan Postgres'e sorgularına dokunmadan geç.
  image:
    src: /logo.svg
    alt: Curvhex ORM
  actions:
    - theme: brand
      text: Başla
      link: /tr/guide/introduction
    - theme: alt
      text: API Referansı
      link: /tr/api/define-model
    - theme: alt
      text: GitHub'da Görüntüle
      link: https://github.com/vertext-labs/orm

features:
  - icon: 🔍
    title: Tanıdık Sorgu API'si
    details: Tıpkı Prisma gibi yaz — findMany, findFirst, count, aggregate, groupBy. Manuel memcmp byte hesabı yok.

  - icon: ⚡
    title: Adaptör Bağımsız
    details: Ücretsiz herhangi bir RPC uç noktasında başla. Büyüdükçe Helius'a veya kendi Postgres indeksleyicine geç — sıfır sorgu değişikliği.

  - icon: 🧩
    title: Varsayılan Olarak Tip Güvenli
    details: Şema tanımları TypeScript çıkarımını tam olarak yönlendirir. Sorgu sonuçların tanımladığın alanlara tam olarak yazılır.

  - icon: 🔗
    title: İlişkiler
    details: include ile ilgili hesapları yükle. Otomatik olarak tekilleştirir — aynı sahibi paylaşan 100 vault, o sahibi yalnızca bir kez çeker.

  - icon: 🧮
    title: Agregasyonlar
    details: sum, avg, min, max, count ve groupBy — bugün RPC üzerinde istemci tarafında çalışıyor, adaptörler olgunlaştıkça sunucu tarafına taşınıyor.

  - icon: 🪝
    title: Otomatik Discriminator'lar
    details: Dahili anchor() yardımcısı, herhangi bir hesap adından 8 baytlık Anchor discriminator'ını hesaplar. IDL ayrıştırması gerekmez.
---

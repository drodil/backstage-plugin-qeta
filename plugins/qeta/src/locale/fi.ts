import { createTranslationMessages } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../translation';

const fi = createTranslationMessages({
  ref: qetaTranslationRef,
  full: false,
  messages: {
    pluginName: 'Q&A',
    'answerList.errorLoading': 'Vastauksia ei voitu ladata',
    'answerList.noAnswers': 'Ei vastauksia',
    'answerList.limitSelect': 'Vastauksia per sivu',
    'common.score': '{{score}} pistettä',
    'common.anonymousAuthor': 'Anonyymi',
    'common.answers_zero': 'Ei vastauksia',
    'common.answers_one': '{{count}} vastaus',
    'common.answers_other': '{{count}} vastausta',
    'common.views_zero': 'Katsottu {{count}} kertaa',
    'common.views_one': 'Katsottu {{count}} kerran',
    'common.views_other': 'Katsottu {{count}} kertaa',
    'common.viewsShort_zero': '0 katselua',
    'common.viewsShort_one': '1 katselu',
    'common.viewsShort_other': '{{count}} katselua',
    'common.questions_zero': 'Ei kysymyksiä',
    'common.questions_one': '{{count}} kysymys',
    'common.questions_other': '{{count}} kysymystä',
    'answer.questionTitle': 'K: {{question}}',
    'answer.answeredTime': 'vastasi',
    'answerContainer.title.answersBy': 'Vastannut',
    'answerContainer.title.answersAbout': 'Vastaukset entiteetistä',
    'answerContainer.title.answersTagged': 'Vastaukset tageilla {{tags}}',
    'answerContainer.search.label': 'Hae vastauksia',
    'answerContainer.search.placeholder': 'Hae...',
    'anonymousCheckbox.tooltip':
      'Valitsemalla tämän muut käyttäjät eivät näe nimeäsi',
    'anonymousCheckbox.answerAnonymously': 'Vastaa anonyymisti',
    'anonymousCheckbox.askAnonymously': 'Kysy anonyymisti',
    'askForm.errorPosting': 'Kysymystä ei voitu luoda',
    'askForm.titleInput.label': 'Otsikko',
    'askForm.titleInput.helperText':
      'Kirjoita kysymyksellesi hyvä otsikko, jonka ihmiset ymmärtävät',
    'askForm.contentInput.placeholder': 'Kysymyksesi',
    'askForm.submit.existingQuestion': 'Tallenna',
    'askForm.submit.newQuestion': 'Kysy',
    'answerForm.errorPosting': 'Vastausta ei voitu luoda',
    'answerForm.contentInput.placeholder': 'Vastauksesi',
    'answerForm.submit.existingAnswer': 'Tallenna',
    'answerForm.submit.newAnswer': 'Vastaa',
    'entitiesInput.label': 'Entiteetit',
    'entitiesInput.placeholder': 'Kirjoita tai valitse entiteetit',
    'entitiesInput.helperText':
      'Valitse maksimissaan {{max}} entiteettiä joita tämä kysymys koskee',
    'tagsInput.label': 'Tägit',
    'tagsInput.placeholder': 'Kirjoita tai valitse tägit',
    'tagsInput.helperText':
      'Valitse maksimissaan {{max}} tägiä jotka kategorisoivat kysymyksen',
    'askPage.title.existingQuestion': 'Muokkaa kysymystä',
    'askPage.title.entityQuestion': 'Kysy kysmys entiteetistä {{entity}}',
    'askPage.title.newQuestion': 'Kysy kysymys',
    'askQuestionButton.title': 'Kysy kysymys',
    'backToQuestionsButton.title': 'Takaisin',
    'commentList.deleteLink': 'poista',
    'commentSection.input.placeholder': 'Kommenttisi',
    'commentSection.addComment': 'Kommentoi',
    'commentSection.post': 'Tallenna',
    'deleteModal.title.question':
      'Oletko varma että haluat poistaa tämän kysymyksen?',
    'deleteModal.title.answer':
      'Oletko varma että haluat poistaa tämän vastauksen?',
    'deleteModal.errorDeleting': 'Virhe poistettaessa',
    'deleteModal.deleteButton': 'Poista',
    'deleteModal.cancelButton': 'Peruuta',
    'favoritePage.title': 'Suosikkikysymyksesi',
    'homePage.title': 'Koti',
    'leftMenu.home': 'Koti',
    'leftMenu.questions': 'Kysymykset',
    'leftMenu.profile': 'Profiili',
    'leftMenu.tags': 'Tägit',
    'leftMenu.favoriteQuestions': 'Suosikkikysymykset',
    'leftMenu.statistics': 'Statistiikka',
    'questionsPage.title': 'Kaikki kysymykset',
    'highlights.loadError': 'Kysymyksiä ei voitu ladata',
    'highlights.hot.title': 'Kuumat kysymykset',
    'highlights.hot.noQuestionsLabel': 'Ei kysymyksiä',
    'highlights.unanswered.title': 'Vastaamattomat kysymykset',
    'highlights.unanswered.noQuestionsLabel': 'Ei kysymyksiä',
    'highlights.incorrect.title': 'Kysymykset ilman oikeaa vastausta',
    'highlights.incorrect.noQuestionsLabel': 'Ei kysymyksiä',
    'rightMenu.followedEntities': 'Seuratut entiteetit',
    'rightMenu.followedTags': 'Seuratut tägit',
    'userLink.anonymous': 'Anonyymi',
    'questionPage.errorLoading': 'Kysymyksiä ei voitu ladata',
    'questionPage.editButton': 'Muokkaa',
    'questionPage.sortAnswers.label': 'Järjestä vastaukset',
    'questionPage.sortAnswers.default': 'Oletus',
    'questionPage.sortAnswers.createdDesc': 'Luotu (laskeva)',
    'questionPage.sortAnswers.createdAsc': 'Luotu (nouseva)',
    'questionPage.sortAnswers.scoreDesc': 'Pisteet (laskeva)',
    'questionPage.sortAnswers.scoreAsc': 'Pisteet (nouseva)',
    'questionPage.sortAnswers.commentsDesc': 'Kommentit (laskeva)',
    'questionPage.sortAnswers.commentsAsc': 'Kommentit (nouseva)',
    'questionPage.sortAnswers.authorDesc': 'Laatija (laskeva)',
    'questionPage.sortAnswers.authorAsc': 'Laatija (nouseva)',
    'questionPage.sortAnswers.updatedDesc': 'Päivitetty (laskeva)',
    'questionPage.sortAnswers.updatedAsc': 'Päivitetty (nouseva)',
    'authorBox.askedAtTime': 'kysytty',
    'authorBox.postedAtTime': 'Lisätty',
    'authorBox.updatedAtTime': 'Päivitetty',
    'authorBox.updatedBy': '',
    'favorite.remove': 'Poista tämä kysymys suosikeista',
    'favorite.add': 'Lisää tämä kysymys suosikkeihin',
    'link.question': 'Kopioi linkki tähän kysymykseen leikepöydälle',
    'link.answer': 'Kopioi linkki tähän vastaukseen leikepöydälle',
    'link.aria': 'Kopioi linkki leikepöydälle',
    'voteButtons.answer.markCorrect': 'Merkitse vastaus oikeaksi',
    'voteButtons.answer.markIncorrect': 'Vastaus ei ole oikein',
    'voteButtons.answer.marked': 'Tämä vastaus on merkitty oikeaksi',
    'voteButtons.answer.good': 'Tämä vastaus on hyvä',
    'voteButtons.answer.bad': 'Tämä vastaus on huono',
    'voteButtons.answer.own': 'Et voi äänestää omaa vastaustasi',
    'voteButtons.question.good': 'Tämä kysymys on hyvä',
    'voteButtons.question.bad': 'Tämä kysymys on huono',
    'voteButtons.question.own': 'Et voi äänestää omaa kysymystäsi',
    'datePicker.from': 'Alku',
    'datePicker.to': 'Loppu',
    'datePicker.invalidRange':
      'Päivien väli on väärin, loppuajan pitää olla suurempi kuin alkuajan',
    'datePicker.range.label': 'Aikaväli',
    'datePicker.range.default': 'Valitse',
    'datePicker.range.last7days': 'Viimeiset 7 päivää',
    'datePicker.range.last30days': 'Viimeiset 30 päivää',
    'datePicker.range.custom': 'Vapaa valinta',
    'filterPanel.filterButton': 'Suodata',
    'filterPanel.noAnswers.label': 'Ei vastauksia',
    'filterPanel.noCorrectAnswers.label': 'Ei oikeita vastauksia',
    'filterPanel.noVotes.label': 'Ei ääniä',
    'filterPanel.orderBy.label': 'Järjestä',
    'filterPanel.orderBy.created': 'Luotu',
    'filterPanel.orderBy.views': 'Katsomiskerrat',
    'filterPanel.orderBy.score': 'Pisteet',
    'filterPanel.orderBy.answers': 'Vastaukset',
    'filterPanel.orderBy.updated': 'Päivitetty',
    'filterPanel.order.label': 'Suunta',
    'filterPanel.order.asc': 'Nouseva',
    'filterPanel.order.desc': 'Laskeva',
    'filterPanel.filters.label': 'Suodattimet',
    'filterPanel.filters.entity.label': 'Entiteetti',
    'filterPanel.filters.entity.placeholder': 'Kirjoita tai valitse entiteetti',
    'filterPanel.filters.tag.label': 'Tägi',
    'filterPanel.filters.tag.placeholder': 'Kirjoita tai valitse tägi',
    'questionList.errorLoading': 'Kysymyksiä ei voitu ladata',
    'questionList.questionsPerPage': 'Kysymyksiä per sivu',
    'questionsContainer.title.questionsBy': 'Kysynyt',
    'questionsContainer.title.questionsAbout': 'Kysymykset entiteestistä',
    'questionsContainer.title.questionsTagged': 'Kysymykset tägeillä {{tags}}',
    'questionsContainer.title.favorite': 'Suosikkikysymyksesi',
    'questionsContainer.search.label': 'Hae kysymyksiä',
    'questionsContainer.search.placeholder': 'Hae...',
    'questionsContainer.noQuestions': 'Ei kysymyksiä',
    'questionsContainer.askOneButton': 'Anna mennä ja kysy yksi!',
    'questionsTable.errorLoading': 'Kysymyksiä ei voitu ladata',
    'questionsTable.latest': 'Viimeisimmät',
    'questionsTable.mostViewed': 'Eniten katsotut',
    'questionsTable.favorites': 'Suosikit',
    'questionsTable.cells.title': 'Otsikko',
    'questionsTable.cells.author': 'Kysyjä',
    'questionsTable.cells.asked': 'Kysytty',
    'questionsTable.cells.updated': 'Päivitetty',
    'statistics.errorLoading': 'Statistiikkaa ei voitu ladata',
    'statistics.notAvailable': 'Statistiikka ei ole saatavissa',
    'statistics.ranking': 'Sijoitukset 🏆',
    'statistics.mostQuestions.title': 'Eniten kysymyksiä',
    'statistics.mostQuestions.description': 'Eniten kysymyksiä kysyneet',
    'statistics.mostAnswers.title': 'Entiten vastauksia',
    'statistics.mostAnswers.description': 'Eniten vastauksia lisänneet',
    'statistics.topVotedQuestions.title': 'Eniten äänestetyt kysymykset',
    'statistics.topVotedQuestions.description':
      'Eniten ääniä keränneet kysyjät',
    'statistics.topVotedAnswers.title': 'Eniten äänestetyt vastaukset',
    'statistics.topVotedAnswers.description':
      'Eniten ääniä keränneet vastaajat',
    'statistics.topVotedCorrectAnswers.title':
      'Eniten äänestetyt oikeat vastaukset',
    'statistics.topVotedCorrectAnswers.description':
      'Eniten ääniä keränneet oikein vastanneet',
    'tagPage.errorLoading': 'Tägejä ei voitu ladata',
    'tagPage.taggedWithTitle': 'Kysymykset tägillä {{tag}}',
    'tagPage.defaultTitle': 'Tägit',
    'tagPage.search.label': 'Hae tägiä',
    'tagPage.search.placeholder': 'Hae...',
    'tagPage.tags_zero': 'Ei tägejä',
    'tagPage.tags_one': '{{count}} tägi',
    'tagPage.tags_other': '{{count}} tägiä',
    'userPage.profileTab': 'Profiili',
    'userPage.questions': 'Kysymykset',
    'userPage.answers': 'Vastaukset',
    'tagButton.follow': 'Seuraa',
    'tagButton.unfollow': 'Lopeta seuraaminen',
    'tagButton.tooltip':
      'Seuraamalla tägiä saat ilmoituksia uusista kysymyksistä',
    'entityButton.follow': 'Seuraa',
    'entityButton.unfollow': 'Lopeta seuraaminen',
    'entityButton.tooltip':
      'Seuraamalla entiteettiä saat ilmoituksia uusista kysymyksistä',
  },
});

export default fi;

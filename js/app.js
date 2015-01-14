(function() {
  var App;

  App = (function() {
    function App(options) {
      var defaults = {};
      this.options = $.extend(defaults, options);
      this.init();  
    }   
    
    App.prototype.init = function(){
      this.book_data = {};
      this.audio_data = {};
      this.audio_timer = false;
      
      this.loadMidi();      
      this.addListeners();      
    };
    
    App.prototype.addBookToUI = function(book){
      var $a = $('<a href="#" class="book" data-id="'+book.id+'" title="'+book.title+' by '+book.author+'">'+book.title+'</a>');
      
      $('#books').append($a);
    };
    
    App.prototype.addListeners = function(){
      var _this = this;
      
      $('body').on('midi-loaded', function(){
        
        _this.loadBooks();
        
        $('#books').on('click', '.book', function(e){
          e.preventDefault();
          var id = $(this).attr('data-id');
          
          _this.loadBookById(id)
        });
      });
    };
    
    App.prototype.loadBookById = function(id){
      var _this = this,
          book_data = this.book_data[id];
      
      // Book data already loaded
      if (book_data) {
        this.loadBook(book_data);
        return;
      }
      
      $.getJSON('data/json/books/'+id+'.json', function(book){
        _this.book_data[id] = book;
        _this.loadBook(book); 
      });   
    };
    
    App.prototype.loadAudio = function(data){
      
      var _this = this,
          note_count = data.notes.length,
          note_index = 0,
          interval = CONFIG.beat_interval,
          book_id = data.book.id,
          $book = $('.book[data-id="'+book_id+'"]');
      
      // clear anything playing
      if (this.audio_interval) {
        window.clearInterval(this.audio_interval);
      }
      
      // play the audio
      this.audio_interval = window.setInterval(function(){
        if (note_index < data.notes.length) {
          var notes = data.notes[note_index];
          
          _.each(notes, function(note){
            console.log('playing note: '+note)
            var delay = CONFIG.note_delay,
                velocity_range = CONFIG.note_velocity,
                multiplier = note / 84,
                velocity = multiplier * (velocity_range[1] - velocity_range[0]) + velocity_range[0];
                
            // play the note
            MIDI.setVolume(0, velocity);
            MIDI.noteOn(0, note, velocity, 0);
            MIDI.noteOff(0, note, delay);
          });
          
          note_index++;
          
        } else {
          window.clearInterval(_this.audio_interval);
        }      
      }, interval );
      
      // add color      
      if (!$book.children('.color').length) {
        _.each(data.colors, function(color){
          var $el = $('<div class="color"></div>'),
              r = color.rgb[0],
              g = color.rgb[1],
              b = color.rgb[2];          
          $el.css({'background-color': 'rgba('+r+','+g+','+b+', 0.5)'});
          $book.append($el);          
        });
      }
      
    };
    
    App.prototype.loadBook = function(book){
      var _this = this,
          audio_data = this.audio_data[book.id];
      
      // Book audio data already loaded
      if (audio_data) {
        this.loadAudio(audio_data);
        return;
      }
      
      audio_data = {};
      
      var notes = [],
          colors = [],
          note_groups = [],
          note_count = CONFIG.notes,
          group_size = Math.round(1/note_count*100),
          scale = SYNESTHESIA.notes,
          octaves = SYNESTHESIA.octaves,
          color_categories = SYNESTHESIA.colors;
      
      // initialize note groups to empty arrays
      _.times(note_count, function(i){
        note_groups[i] = [];
      });
      
      // build notes from words
      _.each(book.words, function(w){
        var word_index = w.index,
            word = w.word,
            color = _.findWhere(COLORS, {name: word}),
            group = _.findWhere(color_categories, {name: color.category}),
            group_index = _this._floorToNearest(word_index / book.total_words * 100, group_size) / group_size;       
         note_groups[group_index].push(group);    
      });
      
      // process notes
      _.each(note_groups, function(groups, i){
        
        var group_notes = [];
        
        _.each(color_categories, function(color_category){
          var matches = _.where(groups, {name: color_category.name}),
              match_count = matches.length > 7 ? 7 : matches.length,
              note = _.indexOf(scale, color_category.note),
              octave = match_count - 1;
          if (octave >= 0 && note >= 0) {
            note = scale.length * octave + note;
            group_notes.push(note);
            colors.push(color_category);
          }
        });
        
        notes.push(group_notes);
        
      });
      
      audio_data.notes = notes;
      audio_data.colors = colors;
      audio_data.book = book;
      
      this.audio_data[book.id] = audio_data;
      this.loadAudio(audio_data);       
    };
    
    App.prototype.loadBooks = function(){
      var _this = this;
      
      $.getJSON('data/json/books.json', function(data){
        var books = data.books;
        
        $('#books').removeClass('loading');
        
        _.each(books, function(book){
          _this.addBookToUI(book);
        });     
        
      });
    };
    
    App.prototype.loadMidi = function(){
      MIDI.loadPlugin({
        soundfontUrl: "./soundfont/",
        instrument: "acoustic_grand_piano",
        callback: function() {
          console.log('loaded sound font.');
          
          $('body').trigger('midi-loaded');
        }
      });
    };
    
    App.prototype._floorToNearest = function(value, roundTo) {
      return Math.floor(value / roundTo) * roundTo;
    };
    
    return App;

  })();

  $(function() {
    return new App({});
  });

}).call(this);


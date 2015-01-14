(function() {
  var App;

  App = (function() {
    function App(options) {
      var defaults = {};
      this.options = $.extend(defaults, options);
      this.init();  
    }   
    
    App.prototype.init = function(){
      this.loadMidi();       
      this.loadData();
      this.addListeners();      
    };
    
    App.prototype.addListeners = function(){
      var _this = this;
      
      $('body').on('midi-loaded', function(){
        
      });
    };
    
    App.prototype.loadData = function(){
      var _this = this;

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
    
    return App;

  })();

  $(function() {
    return new App({});
  });

}).call(this);


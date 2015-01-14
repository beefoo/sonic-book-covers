##
# Script for extracting color words from text files
# Brian Foo (brianfoo.com)
# This file builds the sequence file for use with ChucK from the data supplied
##

import json
import re

# Config
ID = 'peter_pan'
INPUT_FILE = 'txt/'+ID+'.txt'
OUTPUT_FILE = 'json/books/'+ID+'.json'
COLORS = ['beige','bisque','black','almond','blue','brown','bronze','wood','chartreuse','chocolate','coral','silk','crimson','cyan','brick','floral','forest','fuchsia','gainsboro','ghost','gold','goldenrod','gray','green','honeydew','indigo','ivory','khaki','lavender','lawn','lemon','lime','linen','magenta','maroon','midnight','mint','misty','moccasin','navy','oldlace','olive','orange','orchid','papaya','peach','peru','pink','plum','purple','red','rose','rosy','royal','saddle','salmon','sandy','sea','seashell','sienna','silver','sky','slate','snow','spring','steel','tan','teal','thistle','tomato','turquoise','violet','wheat','white','smoke','yellow']

# Init
word_index = 0
words = []

with open(INPUT_FILE,'r') as f:
	for line in f:
		for word in line.split():
			word = re.sub('[^a-z]+', '', word.lower())
			if word in COLORS:
				words.append({
					'word': word,
					'index': word_index
				})
			word_index += 1

print('Found '+str(len(words))+' colors in '+str(word_index)+' words from '+INPUT_FILE)	

# Build JSON
json_data = {
	'id': ID,
	'total_words': word_index,
	'words': words
}

# Write to JSON
with open(OUTPUT_FILE, 'w') as outfile:
	json.dump(json_data, outfile)

print('Successfully wrote to JSON file: '+OUTPUT_FILE)

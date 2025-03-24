# Analyze your Claude Prompts

I wanted to understand my Claude usage better. So I took Claude's help to do this. 

Here is what I did

1. Exported my data
2. Asked Claude to write a script that extracts all my prompts from `conversations.json` which is too large to upload
3. Uploaded `extracted_prompts.json` to Claude
4. Asked it to analyze at a high level

## Exporting Data from Claude

- Browse to [https://claude.ai/settings/profile](https://claude.ai/settings/profile)
- Click on Account → Export Data 
- In a few minutes you will get this in an email

## Extract Prompts

1. Clone this repo

```bash
git clone https://github.com/makash/claude-dataexport-analysis.git
cd claude-dataexport-analysis
```

2. Copy the `conversations.json` to this same director.

3. You will need `nodejs` for the next bit. I am using version v20.11.0.

```bash
node extract_prompts.js path/to/conversations.json
```

For example, if file is in the same directory you can simply use `./conversations.json`

```bash
node extract_prompts.js ./conversations.json
```

If the file runs successfully you will end up with two files

```bash
extracted_prompts.csv
extracted_prompts.json
```

4. Upload the `extracted_prompts.json` to Claude and start prompting

## Sample Prompt

> These are all my prompts. Can you give me high level analytics for this

### Claude's Reply to my prompt

Looking at your conversations export, I can provide some high-level analytics to help you understand your Claude usage patterns.

#### General Statistics

- Total conversations: 138
- Approximate total prompts: 1,048
- Most active topic areas: Cloud security (especially related to Kloudle), marketing/content creation, technical implementation

#### Key Topic Clusters

1. **Cloud Security** (40-45% of conversations)
   - Kloudle product development and marketing
   - AWS/Google Cloud security configurations
   - Security scanning methodologies
   - Enterprise sales strategies

2. **Content Creation** (25-30%)
   - LinkedIn posts and articles
   - Email marketing sequences
   - Storytelling techniques for technical audiences
   - Blog content planning

3. **Technical Implementations** (15-20%)
   - Code review and development
   - Integration with various platforms
   - Data analysis and visualization
   - Authentication systems

4. **Business Strategy** (10-15%)
   - Pricing models
   - Customer feedback analysis
   - Market positioning
   - Competitive analysis

#### Temporal Patterns

- Most of your conversations occurred between December 2024 and March 2025
- Activity appears to be highest during workdays
- Many conversations show iterative refinement of content

#### Engagement Patterns

- You frequently request multiple revisions of the same content
- You often ask for specific formatting or tone adjustments
- You regularly seek feedback on your own drafts rather than starting from scratch
- You show preference for concise, punchy content especially for marketing materials

#### Most Common Requests

1. Reviewing and improving LinkedIn posts
2. Crafting customer communications
3. Analyzing technical data
4. Creating storytelling narratives about cloud security
5. Evaluating business strategies and product positioning

// Enterprise unit test suite validating Arabic Intelligence Framework v8.0.0 architecture.

describe('Arabic Intelligence Framework v8.0.0 Audit', () => {
  const fs = require('fs');
  const path = require('path');

  it('should validate SKILL.md structure, decoupled memory contexts, and stage contracts', () => {
    const skillPath = path.join(__dirname, '../skills/arabic-intelligence/SKILL.md');
    
    expect(fs.existsSync(skillPath)).toBe(true);

    const content = fs.readFileSync(skillPath, 'utf8');
    expect(content).toContain('Arabic Intelligence Framework');
    expect(content).toContain('PlanningContext');
    expect(content).toContain('ReasoningContext');
    expect(content).toContain('KnowledgeContext');
    expect(content).toContain('EvaluationContext');
    expect(content).toContain('Stage Contracts Reference');
  });

  it('should validate entity schema and anti-examples support', () => {
    const schemaPath = path.join(__dirname, '../skills/arabic-intelligence/knowledge/entities/_schema.yaml');
    expect(fs.existsSync(schemaPath)).toBe(true);

    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    expect(schemaContent).toContain('anti_examples');
    expect(schemaContent).toContain('conflicts_with');
    expect(schemaContent).toContain('inherits');
    expect(schemaContent).toContain('depends_on');
  });

  it('should validate domain weights structure', () => {
    const weightsPath = path.join(__dirname, '../skills/arabic-intelligence/knowledge/relations/domain_weights/government.yaml');
    expect(fs.existsSync(weightsPath)).toBe(true);

    const weightsContent = fs.readFileSync(weightsPath, 'utf8');
    expect(weightsContent).toContain('quality');
    expect(weightsContent).toContain('style');
    expect(weightsContent).toContain('optimization');
  });
});

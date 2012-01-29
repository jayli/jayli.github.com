<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wp="http://wordpress.org/export/1.0/"
  xmlns:dsq="http://www.disqus.com/">

<xsl:output method="text"/>
<xsl:output method="text" name="txt"/>

<xsl:variable name='newline'><xsl:text>
</xsl:text></xsl:variable>

<xsl:variable name='space'><xsl:text> </xsl:text></xsl:variable>

<xsl:strip-space elements="category" />

<xsl:template match="channel">
  <xsl:apply-templates select="item[wp:post_type = 'post']"/>
</xsl:template>

<xsl:template match="item">
  <xsl:variable name="basename"
    select="concat('posts/', replace(link, 'http://gopherwood.info/([0-9]{4})/([0-9]{2})/([0-9]{2})/(.*)/', '$1/$2/$3/$4'))" />
  <xsl:variable name="filename" select="concat($basename, '.mdwn')" />
  <xsl:text>Creating </xsl:text>
  <xsl:value-of select="concat($filename, $newline)" />
  <xsl:result-document href="{$filename}" format="txt">
    <xsl:text>[[!meta title="</xsl:text>
    <xsl:value-of select="replace(title, '&quot;', '&amp;ldquo;')"/>
    <xsl:text>"]]</xsl:text><xsl:value-of select="$newline"/>
    <xsl:text>[[!meta date="</xsl:text>
    <xsl:value-of select="pubDate"/>
    <xsl:text>"]]</xsl:text><xsl:value-of select="$newline"/>
    <xsl:text>[[!meta updated="</xsl:text>
    <xsl:value-of select="pubDate"/>
    <xsl:text>"]]</xsl:text> <xsl:value-of select="$newline"/>
    <xsl:text>[[!meta guid="</xsl:text>
    <xsl:value-of select="dsq:thread_identifier"/>
    <xsl:text>"]]</xsl:text> <xsl:value-of select="$newline"/>
    <xsl:value-of select="$newline"/>
    <xsl:value-of select="content:encoded"/>
    <xsl:value-of select="$newline"/>
    <xsl:value-of select="$newline"/>
    <xsl:text>[[!tag </xsl:text>
    <xsl:apply-templates select="category[@domain='tag' and not(@nicename)]">
      <xsl:sort select="name()"/>
    </xsl:apply-templates>
    <xsl:text>]]</xsl:text>
  </xsl:result-document>
</xsl:template>

<xsl:template match="category">
  <xsl:value-of select="." /><xsl:if test="position()!=last()"><xsl:value-of select="$space"/></xsl:if>
</xsl:template>
</xsl:stylesheet>
